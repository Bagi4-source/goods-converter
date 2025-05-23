import { CSVStream } from "../streams/CSVStream";
import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

export class CSVFormatter implements FormatterAbstract {
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
    csvStream.writableStream.pipe(writableStream);
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
      "timeDeliveryMin",
      "timeDeliveryMax",
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
    products.forEach((product) => {
      Object.entries(product).forEach(([key, value]) => {
        if (value) columns.add(key);
      });
    });
    csvStream.setColumns(columns);
    for (const product of products) {
      const row: Record<string, any> = {
        ...product,
        category: mappedCategories[product.categoryId],
        images: product.images?.join(","),
        videos: product.videos?.join(","),
        tags: product.tags?.join(","),
        codesTN: product.codesTN?.join(", "),
        params: product.params
          ?.map(({ key, value }) => `${key}=${value}`)
          .join(", "),
        properties: product.properties
          ?.map(({ key, value }) => `${key}=${value}`)
          .join(", "),
        sizes: product.sizes
          ?.map(({ name, value }) => `${name}=${value}`)
          .join(", "),
        keywords: product.keywords?.join(","),
        relatedProducts: product.relatedProducts?.join(","),
        timeDeliveryMin: product.timeDelivery?.min,
        timeDeliveryMax: product.timeDelivery?.max,
      };
      await csvStream.addRow(row);
    }

    // Закрываем поток
    csvStream.writableStream.end();
  }
}
