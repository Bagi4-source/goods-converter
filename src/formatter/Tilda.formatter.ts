import { CSVStream } from "../streams/CSVStream";
import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

export class TildaFormatter implements FormatterAbstract {
  public formatterName = "Tilda";
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
      "SKU",
      "Brand",
      "Category",
      "Title",
      "Text",
      "Photo",
      "Price",
      "Price Old",
      "Quantity",
      "Editions",
      "External ID",
      "Parent UID",
    ]);
    csvStream.setColumns(columns);
    for (const product of products) {
      const row: Record<string, string | number | undefined> = {
        SKU: product.vendorCode,
        Brand: product.vendor,
        Category: mappedCategories[product.categoryId],
        Title: product.title,
        Text: product.description,
        Photo: product.images?.join(";"),
        Price: product.price,
        "Price Old": product.oldPrice,
        Quantity: product.count,
        Editions: product.params
          ?.map(({ key, value }) => `${key}:${value}`)
          .join(";"),
        "External ID": product.variantId,
        "Parent UID": product.parentId,
      };
      await csvStream.addRow(row);
    }

    csvStream.writableStream.end();
  }
}
