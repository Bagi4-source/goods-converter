import { CSVStream } from "../streams/CSVStream";
import { type IParam, type Brand, type Category, type Product } from "../types";
import { buildCategoryPaths, urlQueryEncode } from "../utils";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

export interface CreateAttributeProps {
  name?: string;
  id?: number;
  values?: string | number;
  visible?: number;
  global?: number;
}

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
    const keyWithoutInvalidCharacters = key
      .replaceAll(",", "")
      .replaceAll(";", "");

    return keyWithoutInvalidCharacters.length >= 28
      ? keyWithoutInvalidCharacters.slice(0, 24) + "..."
      : keyWithoutInvalidCharacters;
  }

  private formatValueAttribute(value: string) {
    return value.replaceAll(",", "").replaceAll(";", "");
  }

  private formatProducts(products: Product[]) {
    const formatParams = (params: IParam[] | undefined) => {
      return params?.map(({ key, value }) => {
        const formatedKey = this.formatKeyAttribute(key);
        const formatedValue = this.formatValueAttribute(value);
        return { key: formatedKey, value: formatedValue };
      });
    };

    return products.map((product) => {
      const params = formatParams(product.params);
      const properties = formatParams(product.properties);
      return { ...product, params, properties };
    });
  }

  private createAttribute(data: CreateAttributeProps) {
    if (!data?.name || data.id === undefined) return;

    const attributeStartName = "Attribute";

    const attribute: Record<string, string | number> = {};

    attribute[`${attributeStartName} ${data.id} name`] = data.name;

    if (data.values !== undefined)
      attribute[`${attributeStartName} ${data.id} value(s)`] = data.values;
    if (data.visible !== undefined)
      attribute[`${attributeStartName} ${data.id} visible`] = data.visible;
    if (data.global !== undefined)
      attribute[`${attributeStartName} ${data.id} global`] = data.global;

    return attribute;
  }

  private extractAttributes(products: Product[]) {
    const formatedProducts = this.formatProducts(products);
    const paramsMap = new Map<number, Record<string, string | number>>();
    const propertiesMap = new Map<number, Record<string, string | number>>();
    const uniqueAttributes = new Map<string, number>();

    const genderTitle = "Пол";

    formatedProducts.forEach((product) => {
      product.params?.forEach(({ key }) => {
        if (!uniqueAttributes.has(key)) {
          uniqueAttributes.set(key, uniqueAttributes.size);
        }
      });

      uniqueAttributes.set(genderTitle, uniqueAttributes.size);

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
        const index = uniqueAttributes.get(key);

        if (index === undefined) {
          console.error(`Не нашлось уникального ключа для параметра - ${key}`);
          return;
        }

        const attribute = this.createAttribute({
          name: key,
          id: index,
          values: value,
          visible: 0,
          global: 0,
        });

        if (!attribute) return;

        Object.entries(attribute).forEach(
          ([key, value]) => (paramAttributes[key] = value),
        );
      });

      const genderIndex = uniqueAttributes.get(genderTitle);

      const genderAttribute = this.createAttribute({
        name: genderTitle,
        id: genderIndex,
        values: product.gender,
        global: 0,
      });

      if (genderAttribute) {
        Object.entries(genderAttribute).forEach(
          ([key, value]) => (propertyAttributes[key] = value),
        );
      }

      product.properties?.forEach(({ key, value }) => {
        const index = uniqueAttributes.get(key);

        if (index === undefined) {
          console.error(`Не нашлось уникального ключа для параметра - ${key}`);
          return;
        }

        if (paramAttributes[`Attribute ${index} name`]) {
          console.warn(`Данное свойство уже существует в параметрах - ${key}`);
          return;
        }

        const attribute = this.createAttribute({
          name: key,
          id: index,
          values: value,
          global: 0,
        });

        if (!attribute) return;

        Object.entries(attribute).forEach(
          ([key, value]) => (propertyAttributes[key] = value),
        );
      });

      paramsMap.set(product.variantId, paramAttributes);
      propertiesMap.set(product.variantId, propertyAttributes);
    });

    return { params: paramsMap, properties: propertiesMap };
  }

  private removeVisibleFromAttributes(params: Record<string, string | number>) {
    Object.entries(params).forEach(([key]) => {
      if (key.includes("visible")) params[key] = "";
    });
  }

  public async format(
    writableStream: Writable,
    products: Product[],
    categories?: Category[],
    _?: Brand[],
    __?: FormatterOptions,
  ): Promise<void> {
    const categoriePaths = buildCategoryPaths(categories ?? []);

    const csvStream = new CSVStream({
      delimiter: ";",
      emptyFieldValue: "",
      lineSeparator: "\n",
    });
    csvStream.getWritableStream().pipe(writableStream);
    const columns = new Set<string>(this.DEFAULT_COLUMNS);

    const attributes = this.extractAttributes(products);

    const variationsByParentId = new Map<
      number,
      Array<Record<string, string | number | undefined>>
    >();

    const imagesByParentId = new Map<number, string | undefined>();

    const variations = products.map((product, index) => {
      const pathsArray = categoriePaths
        .get(product.categoryId)
        ?.map((category) => category.name);

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
        Categories: pathsArray?.join(" > "),
        Tags: product.keywords?.join(","),
        Images: "",
      };

      const productParams = attributes.params.get(product.variantId) ?? {};

      if (!imagesByParentId.has(row.Parent)) {
        const images = product.images?.map(urlQueryEncode).join(",");
        imagesByParentId.set(row.Parent, images);
      }

      this.removeVisibleFromAttributes(productParams);

      row = { ...row, ...productParams };

      if (variationsByParentId.has(row.Parent)) {
        variationsByParentId.get(row.Parent)?.push(row);
      } else {
        variationsByParentId.set(row.Parent, [row]);
      }

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
        Images: imagesByParentId.get(product.Parent) ?? "",
      };

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
    variableProducts.forEach((parentProduct) => {
      csvStream.addRow(parentProduct);

      variationsByParentId
        .get(parentProduct.ID)
        ?.forEach((variationProduct) => {
          csvStream.addRow(variationProduct);
        });
    });

    csvStream.getWritableStream().end();
  }
}
