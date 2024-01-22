import xlsx from "xlsx";

import { type Brand, type Category, type Product } from "../types";
import { UTILS } from "../util/formatter.util";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";
const { writeXLSX, utils } = xlsx;

export class ExcelFormatter implements FormatterAbstract {
  public formatterName = "Excel";
  public fileExtension = Extension.XLSX;

  public async format(
    products: Product[],
    categories?: Category[],
    _?: Brand[],
    options?: FormatterOptions,
  ): Promise<Buffer> {
    const mappedCategories: Record<number, string> = {};
    categories?.forEach(({ id, name }) => (mappedCategories[id] = name));

    const data = products.map((product) => ({
      ...product,
      category: mappedCategories[product.categoryId],
      images: product.images?.join(","),
      videos: product.videos?.join(","),
      tags: product.tags?.join(","),
      keywords: product.keywords?.join(","),
      relatedProducts: product.relatedProducts?.join(","),
      codesTN: product.codesTN?.join(", "),
      params: product.params
        ?.map(({ key, value }) => `${key}=${value}`)
        .join(","),
      sizes: undefined,
      ...UTILS.getParams(product, options),
      ...UTILS.getProperties(product, options),
      ...UTILS.getSizes(product, options),
    }));
    const workBook = utils.book_new();
    const productsWorkSheet = utils.json_to_sheet(data);

    utils.book_append_sheet(workBook, productsWorkSheet, "products");
    return writeXLSX(workBook, { type: "buffer" });
  }
}
