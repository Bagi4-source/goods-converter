import { JsonStreamStringify } from "json-stream-stringify";

import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Stream } from "stream";

export class JSONFormatter implements FormatterAbstract {
  public formatterName = "JSON";
  public fileExtension = Extension.JSON;

  public async format(
    products: Product[],
    categories?: Category[],
    brands?: Brand[],
    _?: FormatterOptions,
  ): Promise<Stream> {
    return new JsonStreamStringify({
      categories,
      brands,
      products,
    });
  }
}
