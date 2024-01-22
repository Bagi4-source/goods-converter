import { type Product, type Category } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

export class JSONFormatter implements FormatterAbstract {
  public formatterName = "JSON";
  public fileExtension = Extension.JSON;

  public async format(
    products: Product[],
    categories?: Category[],
    _?: FormatterOptions,
  ): Promise<string> {
    const result = {
      categories,
      products,
    };

    return JSON.stringify(result);
  }
}
