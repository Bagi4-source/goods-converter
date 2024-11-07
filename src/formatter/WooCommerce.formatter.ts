import { CSVStream } from "../streams/CSVStream";
import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

export class WooCommerceFormatter implements FormatterAbstract {
  public formatterName = "WooCommerce";
  public fileExtension = Extension.CSV;

  private readonly DEFAULT_COLUMNS = [
    "ID",
    "Type",
    "SKU",
    "Name",
    "Parent",
    "Short description",
    "Description",
    "Stock",
    "Regular price",
    "Position",
    "Categories",
    "Tags",
    "Images",
  ];

  private formatKeyAttribute(key: string) {
    return key.length >= 28
      ? key.slice(0, 24).replaceAll(",", "").replaceAll(";", "") + "..."
      : key.replaceAll(",", "").replaceAll(";", "");
  }

  private formatValueAttribute(value: string) {
    return value.replaceAll(",", "").replaceAll(";", "");
  }

  private formatProducts(products: Product[]) {
    return products.map((product) => {
      const params = product.params?.map(({ key, value }) => {
        const formatedKey = this.formatKeyAttribute(key);
        const formatedValue = this.formatValueAttribute(value);
        return { key: formatedKey, value: formatedValue };
      });

      const properties = product.properties?.map(({ key, value }) => {
        const formatedKey = this.formatKeyAttribute(key);
        const formatedValue = this.formatValueAttribute(value);
        return { key: formatedKey, value: formatedValue };
      });

      return { ...product, params, properties };
    });
  }

  private extractAttributes(products: Product[]) {
    const formatedProducts = this.formatProducts(products);
    const paramsMap = new Map<number, Record<string, string | number>>();
    const propertiesMap = new Map<number, Record<string, string | number>>();
    const uniqueAttributes = new Map<string, number>();

    formatedProducts.forEach((product) => {
      product.params?.forEach(({ key }) => {
        if (!uniqueAttributes.has(key)) {
          uniqueAttributes.set(key, uniqueAttributes.size);
        }
      });

      product.properties?.forEach(({ key }) => {
        if (!uniqueAttributes.has(key)) {
          uniqueAttributes.set(key, uniqueAttributes.size);
        }
      });
    });

    formatedProducts.forEach((product) => {
      const paramAttributes = paramsMap.get(product.variantId) ?? {};
      const propertyAttributes = propertiesMap.get(product.variantId) ?? {};

      product.params?.forEach(({ key, value }) => {
        const index = uniqueAttributes.get(key) ?? 0;

        paramAttributes[`Attribute ${index} name`] = key;
        paramAttributes[`Attribute ${index} value(s)`] = value;
        paramAttributes[`Attribute ${index} visible`] = 0;
        paramAttributes[`Attribute ${index} global`] = 0;
      });

      product.properties?.forEach(({ key, value }) => {
        const index = uniqueAttributes.get(key) ?? 0;

        propertyAttributes[`Attribute ${index} name`] = key;
        propertyAttributes[`Attribute ${index} value(s)`] = value;
        propertyAttributes[`Attribute ${index} global`] = 0;
      });

      paramsMap.set(product.variantId, paramAttributes);
      propertiesMap.set(product.variantId, propertyAttributes);
    });

    return { params: paramsMap, properties: propertiesMap };
  }

  public async format(
    writableStream: Writable,
    products: Product[],
    categories?: Category[],
    _?: Brand[],
    __?: FormatterOptions,
  ): Promise<void> {
    const categoryMap: Record<number, string> = {};
    categories?.forEach(({ id, name }) => {
      categoryMap[id] = name;
    });

    const csvStream = new CSVStream({
      delimiter: ";",
      emptyFieldValue: "",
      lineSeparator: "\n",
    });
    csvStream.getWritableStream().pipe(writableStream);
    const columns = new Set<string>(this.DEFAULT_COLUMNS);

    const attributes = this.extractAttributes(products);

    const variations = products.map((product, index) => {
      let row = {
        ID: product.variantId,
        Type: "variation",
        SKU: product.variantId,
        Name: product.title,
        Parent: product.parentId ?? 0,
        "Short description": "",
        Description: product.description,
        Stock: product.count ?? 0,
        "Regular price": product.price,
        Position: index + 1,
        Categories: categoryMap[product.categoryId],
        Tags: product.keywords?.join(","),
        Images: product.images?.join(","),
      };

      const productParams = attributes.params.get(product.variantId) ?? {};

      Object.entries(productParams).forEach(([key]) => {
        if (key.includes("visible")) productParams[key] = "";
      });

      row = { ...row, ...productParams };

      return row;
    });

    const parentProducts = new Map<number, any>();

    variations.forEach((product) => {
      const currentParent = parentProducts.get(product.Parent);

      let row = {
        ...product,
        Type: "variable",
        ID: product.Parent,
        SKU: product.Parent,
        Position: 0,
        Parent: "",
        "Regular price": "",
      };

      if (currentParent?.Stock)
        row.Stock = (currentParent?.Stock || 0) + (product?.Stock || 0);

      const productParams = attributes.params.get(product.SKU) ?? {};
      const productProperties = attributes.properties.get(product.SKU) ?? {};

      Object.entries(productParams).forEach(([key]) => {
        if (key.includes("visible")) productParams[key] = 0;
      });

      if (currentParent) {
        Object.entries(productParams).forEach(([key, value]) => {
          if (key.includes("value(s)")) {
            productParams[key] = currentParent[key] + `, ${value}`;
          }
        });
      }

      Object.keys({ ...row, ...productParams, ...productProperties }).forEach(
        (item) => columns.add(item),
      );

      row = { ...row, ...productParams, ...productProperties };

      parentProducts.set(product.Parent, row);
    });

    const variableProducts = Array.from(parentProducts.values());

    csvStream.setColumns(columns);
    [...variableProducts, ...variations].forEach((product) => {
      csvStream.addRow(product);
    });

    csvStream.getWritableStream().end();
  }
}
