import { CSVStream } from "../streams/CSVStream";
import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Stream } from "stream";

export class CSVFormatter implements FormatterAbstract {
  public formatterName = "CSV";
  public fileExtension = Extension.CSV;

  public async format(
    products: Product[],
    categories?: Category[],
    _?: Brand[],
    __?: FormatterOptions,
  ): Promise<Stream> {
    const mappedCategories: Record<number, string> = {};
    categories?.forEach(({ id, name }) => (mappedCategories[id] = name));

    const csvStream = new CSVStream({
      delimiter: ";",
      emptyFieldValue: "",
      lineSeparator: "\n",
    });
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
    products.forEach((product) => {
      Object.entries(product).forEach(([key, value]) => {
        if (value) columns.add(key);
      });
    });
    csvStream.setColumns(columns);
    products.forEach((product) => {
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
      };
      csvStream.addRow(row);
    });
    return csvStream.getWritableStream();
  }
}
