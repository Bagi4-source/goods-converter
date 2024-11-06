import { CSVStream } from "../streams/CSVStream";
import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

export class WooCommerceFormatter implements FormatterAbstract {
  public formatterName = "CSV";
  public fileExtension = Extension.CSV;
  private readonly DEFAULT_COLUMN = [
    "ID",
    "Type",
    "SKU",
    "Name",
    "Parent",
    "Short description",
    "Description",
    "Stock",
    "Regular price",
    "Categories",
    "Tags",
    "Images",
  ];

  private getAttributes(
    products: Product[],
  ): Map<number, Record<string, string | number>> {
    const attributes = new Map<number, Record<string, string | number>>();
    const uniqAttributes = new Map<string, number>();

    products.forEach((product) => {
      product.params?.forEach(({ key }) => {
        uniqAttributes.has(key)
          ? uniqAttributes.get(key)
          : uniqAttributes.set(key, uniqAttributes.size);
      });

      product.properties?.forEach(({ key }) => {
        uniqAttributes.has(key)
          ? uniqAttributes.get(key)
          : uniqAttributes.set(key, uniqAttributes.size);
      });
    });

    products.forEach((product) => {
      const attribute = attributes.get(product.variantId) ?? {};

      product.params?.forEach(({ key, value }) => {
        const keyIndex = uniqAttributes.get(key) ?? 0;

        attribute[`Attribute ${keyIndex} default`] = value;
        attribute[`Attribute ${keyIndex} name`] = key;
        attribute[`Attribute ${keyIndex} value(s)`] = value;
        attribute[`Attribute ${keyIndex} visible`] = 1;
        attribute[`Attribute ${keyIndex} global`] = 1;
      });

      product.properties?.forEach(({ key, value }) => {
        const keyIndex = uniqAttributes.get(key) ?? 0;

        attribute[`Attribute ${keyIndex} name`] = key;
        attribute[`Attribute ${keyIndex} value(s)`] = value;
      });

      attributes.set(product.variantId, attribute);
    });

    return attributes;
  }

  public async format(
    writableStream: Writable,
    products: Product[],
    categories?: Category[],
    _?: Brand[],
    __?: FormatterOptions,
  ): Promise<void> {
    const mappedCategories: Record<number, string> = {};
    categories?.forEach(({ id, name }) => (mappedCategories[id] = name));

    const csvStream = new CSVStream({
      delimiter: ";",
      emptyFieldValue: "",
      lineSeparator: "\n",
    });
    csvStream.getWritableStream().pipe(writableStream);
    const columns = new Set<string>(this.DEFAULT_COLUMN);

    const attributes = this.getAttributes(products);

    const mappedProducts = products.map((product) => {
      let row = {
        ID: "",
        Type: "variation",
        SKU: product.variantId,
        Name: product.title,
        Parent: product.parentId,
        "Short description": "",
        Description: product.description,
        Stock: product.count,
        "Regular price": product.price,
        Categories: mappedCategories[product.categoryId],
        Tags: product.keywords,
        Images: product.images?.join(","),
      };

      const productAttributes = attributes.get(product.variantId) ?? {};

      Object.keys(productAttributes).forEach((item) => columns.add(item));

      row = { ...row, ...productAttributes };

      return row;
    });

    const parents: Array<Record<string, unknown>> = [];
    const parentsIds: number[] = [];

    mappedProducts.forEach((product) => {
      if (!product.Parent) return;
      if (parentsIds.includes(product.Parent)) return;
      parentsIds.push(product.Parent);

      const row = {
        ...product,
        Type: "variable",
        SKU: product.Parent,
        "Regular price": "",
      };

      parents.push(row);
    });

    csvStream.setColumns(columns);

    mappedProducts.forEach((product) => {
      csvStream.addRow(product);
    });
    parents.forEach((product) => {
      csvStream.addRow(product);
    });
    // Закрываем поток
    csvStream.getWritableStream().end();
  }
}
