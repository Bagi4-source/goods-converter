import pkg from "exceljs";

import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";
const { stream } = pkg;

export class ExcelFormatter implements FormatterAbstract {
  public formatterName = "Excel";
  public fileExtension = Extension.XLSX;

  public async format(
    writableStream: Writable,
    products: Product[],
    categories?: Category[],
    _?: Brand[],
    __?: FormatterOptions,
  ): Promise<void> {
    const mappedCategories: Record<number, string> = {};
    categories?.forEach(({ id, name }) => (mappedCategories[id] = name));
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
      "timeDelivery",
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

    const workbook = new stream.xlsx.WorkbookWriter({
      stream: writableStream,
    });
    const worksheet = workbook.addWorksheet("products");
    worksheet.columns = Array.from(columns).map((column) => ({
      key: column,
      header: column,
    }));

    products.forEach((product) => {
      const row = {
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
          .join(", "),
        properties: product.properties
          ?.map(({ key, value }) => `${key}=${value}`)
          .join(", "),
        sizes: product.sizes
          ?.map(({ name, value }) => `${name}=${value}`)
          .join(", "),
        timeDelivery: product.timeDelivery
          ? `${product.timeDelivery.min}-${product.timeDelivery.max}`
          : undefined,
      };
      worksheet.addRow(row).commit();
    });
    worksheet.commit();
    await workbook.commit();
  }
}
