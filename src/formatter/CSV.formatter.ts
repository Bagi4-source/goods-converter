import { json2csv } from "json-2-csv";

import { type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";
import {UTILS} from "../util/formatter.util";

export class CSVFormatter implements FormatterAbstract {
  public formatterName = "CSV";
  public fileExtension = Extension.CSV;

  public async format(
    products: Product[],
    categories?: Category[],
    options?: FormatterOptions,
  ): Promise<string> {
    const mappedCategories: Record<number, string> = {};
    categories?.forEach(({ id, name }) => (mappedCategories[id] = name));

    const data = products.map((product) => ({
      ...product,
      category: mappedCategories[product.categoryId],
      images: product.images?.join(","),
      videos: product.videos?.join(","),
      tags: product.tags?.join(","),
      codesTN: product.codesTN?.join(", "),
      params: product.params
        ?.map(({ key, value }) => `${key}=${value}`)
        .join(","),
      ...UTILS.getParams(product, options),
      ...UTILS.getProperties(product, options),
      ...UTILS.getSizes(product, options),
      sizes: undefined,
      keywords: product.keywords?.join(","),
      relatedProducts: product.relatedProducts?.join(","),
    }));
    return json2csv(data, { emptyFieldValue: "" });
  }
}
