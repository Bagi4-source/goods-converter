import { CSVStream } from "../streams/CSVStream";
import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

export class WooCommerceFormater implements FormatterAbstract {
  public formatterName = "CSV";
  public fileExtension = Extension.CSV;

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
    const columns = new Set<string>([
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
      "params",
      "properties",
      "sizes",
      "keywords",
      "relatedProducts",
    ]);

    const properties = new Map();

    products.forEach((product) => {
      product.params?.forEach((param) => {
        if (param.value) {
          properties.set(param.key, properties.size + 1);
        }
      });
    });

    const mappedProducts = products.map((product) => {
      const row: Record<string, unknown> = {
        ...product,
        category: mappedCategories[product.categoryId],
        images: product.images?.join("|"),
        videos: product.videos?.join("|"),
        tags: product.tags?.join(","),
        codesTN: product.codesTN?.join(", "),
        properties: product.properties
          ?.map(({ key, value }) => `${key}=${value}`)
          .join(", "),
        sizes: product.sizes
          ?.map(({ name, value }) => `${name}=${value}`)
          .join(", "),
        keywords: product.keywords?.join(","),
        relatedProducts: product.relatedProducts?.join(","),
      };

      product.params?.forEach(({ key, value }) => {
        const index = properties.get(key);

        row[`Attribute ${index} name`] = key;
        row[`Attribute ${index} value`] = value;
      });

      return row;
    });

    mappedProducts.forEach((product) => {
      Object.entries(product).forEach(([key, value]) => {
        if (value) columns.add(key);
      });
    });

    csvStream.setColumns(columns);

    mappedProducts.forEach((product) => {
      csvStream.addRow(product);
    });
    // Закрываем поток
    csvStream.getWritableStream().end();
  }
}
