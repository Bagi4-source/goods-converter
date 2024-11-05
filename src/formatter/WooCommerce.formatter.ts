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
    "url",
    "productId",
    "parentId",
    "variantId",
    "title",
    "description",
    "vendor",
    "vendorCode",
    "category",
    "images",
    "videos",
    "price",
    "oldPrice",
    "purchasePrice",
    "currency",
    "saleDate",
    "countryOfOrigin",
    "tags",
    "codesTN",
    "sizes",
    "keywords",
    "relatedProducts",
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
      const attribute = attributes.get(product.productId) ?? {};

      product.params?.forEach(({ key, value }, index) => {
        const keyIndex = uniqAttributes.get(key) ?? 0;

        if (index === 0) {
          attribute[`Attribute ${keyIndex} default`] = key;
        }

        attribute[`Attribute ${keyIndex} name`] = key;
        attribute[`Attribute ${keyIndex} value(s)`] = value;
        attribute[`Attribute ${keyIndex} visible`] = 1;
      });

      product.properties?.forEach(({ key, value }) => {
        const keyIndex = uniqAttributes.get(key) ?? 0;

        attribute[`Attribute ${keyIndex} name`] = key;
        attribute[`Attribute ${keyIndex} value(s)`] = value;
        attribute[`Attribute ${keyIndex} global`] = 1;
      });

      attributes.set(product.productId, attribute);
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
      let row: Record<string, string | number | undefined | boolean> = {
        ...product,
        params: undefined,
        properties: undefined,
        category: mappedCategories[product.categoryId],
        images: product.images?.join("|"),
        videos: product.videos?.join("|"),
        tags: product.tags?.join(","),
        codesTN: product.codesTN?.join(", "),
        age: product.age?.value,
        sizes: product.sizes
          ?.map(({ name, value }) => `${name}=${value}`)
          .join(", "),
        keywords: product.keywords?.join(","),
        relatedProducts: product.relatedProducts?.join(","),
      };

      const productAttributes = attributes.get(product.productId) ?? {};

      Object.keys(productAttributes).forEach((item) => columns.add(item));

      row = { ...row, ...productAttributes };

      return row;
    });

    csvStream.setColumns(columns);

    mappedProducts.forEach((product) => {
      csvStream.addRow(product);
    });
    // Закрываем поток
    csvStream.getWritableStream().end();
  }
}
