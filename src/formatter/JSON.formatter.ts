import { type Product, type Category, type Brand } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { PassThrough, type Readable } from "stream";

export class JSONFormatter implements FormatterAbstract {
  public formatterName = "JSON";
  public fileExtension = Extension.JSON;

  public async format(
    products: Product[],
    categories?: Category[],
    brands?: Brand[],
    _?: FormatterOptions,
  ): Promise<Readable> {
    const result = new PassThrough();
    result.write("{");

    result.write('"categories": [');
    categories?.forEach((category, index) => {
      result.write(JSON.stringify(category));
      if (index < categories.length - 1) {
        result.write(",");
      }
    });
    result.write("],");

    result.write('"brands": [');
    brands?.forEach((brand, index) => {
      result.write(JSON.stringify(brand));
      if (index < brands.length - 1) {
        result.write(",");
      }
    });
    result.write("],");

    result.write('"products": [');
    products.forEach((product, index) => {
      result.write(JSON.stringify(product));
      if (index < products.length - 1) {
        result.write(",");
      }
    });
    result.write("]");

    result.write("}");
    return result;
  }
}
