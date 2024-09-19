import { JsonStreamStringify } from "json-stream-stringify";

import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

export class JSONFormatter implements FormatterAbstract {
  public formatterName = "JSON";
  public fileExtension = Extension.JSON;

  public async format(
    writableStream: Writable,
    products: Product[],
    categories?: Category[],
    brands?: Brand[],
    _?: FormatterOptions,
  ): Promise<void> {
    const stream = new JsonStreamStringify({
      categories,
      brands,
      products,
    });
    stream.pipe(writableStream);
  }
}
