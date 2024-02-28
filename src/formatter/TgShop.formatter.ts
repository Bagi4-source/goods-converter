import { stream } from "exceljs";

import { type Brand, type Category, type IParam, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Stream } from "stream";

export class TgShopFormatter implements FormatterAbstract {
  public formatterName = "TgShop";
  public fileExtension = Extension.XLSX;

  public async format(
    products: Product[],
    categories?: Category[],
    _?: Brand[],
    __?: FormatterOptions,
  ): Promise<Stream> {
    const getParameter = (product: Product, key: string): IParam | undefined =>
      product.params?.find((value) => value.key === key);

    const convertProduct = (product: Product) => ({
      "category id": product.categoryId,
      "group id": product.parentId,
      "id product": product.variantId,
      "name product": product.title,
      price: product.price,
      picture: product.images?.join(", "),
      vendorCode: product.vendorCode,
      oldprice: product.oldPrice,
      description: product.description,
      shortDescription: "",
      quantityInStock: product.count,
      color: getParameter(product, "color")?.value,
      size: getParameter(product, "size")?.value,
      priority: undefined,
    });
    const workbook = new stream.xlsx.WorkbookWriter({});
    const categoryWorksheet = workbook.addWorksheet("categories");
    const productsWorksheet = workbook.addWorksheet("offers");
    categoryWorksheet.columns = [
      {
        header: "id",
        key: "id",
      },
      {
        header: "parentId",
        key: "parentId",
      },
      {
        header: "name",
        key: "name",
      },
    ];
    const columns = [
      "category id",
      "group id",
      "id product",
      "name product",
      "price",
      "picture",
      "vendorCode",
      "oldprice",
      "description",
      "shortDescription",
      "quantityInStock",
      "color",
      "size",
      "priority",
    ];

    productsWorksheet.columns = columns.map((column) => ({
      header: column,
      key: column,
    }));

    categories?.forEach((category) => {
      categoryWorksheet.addRow(category).commit();
    });

    products.forEach((product) => {
      productsWorksheet.addRow(convertProduct(product)).commit();
    });
    categoryWorksheet.commit();
    productsWorksheet.commit();

    await workbook.commit();
    // @ts-ignore
    return workbook.stream;
  }
}
