import xlsx from "xlsx";

import { type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

export class InsalesFormatter implements FormatterAbstract {
  public formatterName = "Insales";
  public fileExtension = Extension.XLSX;

  public async format(
    products: Product[],
    categories?: Category[],
    _?: FormatterOptions,
  ): Promise<Buffer> {
    const mappedCategories: Record<number, Category> = {};
    categories?.forEach(
      (category) => (mappedCategories[category.id] = category),
    );

    const getParams = (product: Product): Record<string, string> => {
      const properties: Record<string, string> = {};

      product.params?.forEach(
        (p) => (properties[`Свойство: ${p.key}`] = p.value),
      );

      return properties;
    };
    const getProperties = (product: Product): Record<string, string> => {
      const properties: Record<string, string> = {};

      product.properties?.forEach(
        (p) => (properties[`Параметр: ${p.key}`] = p.value),
      );

      return properties;
    };

    const getCategories = (product: Product) => {
      const categories: Record<string, string> = {};

      function addCategory(categoryId: number | undefined, level: number) {
        if (categoryId === undefined) return;

        const key = level <= 0 ? "Корневая" : `Подкатегория ${level}`;
        const category = mappedCategories[categoryId];
        if (category) {
          categories[key] = category.name;
          addCategory(category.parentId, level + 1);
        }
      }

      addCategory(product.categoryId, 0);

      return categories;
    };

    const data = products.map((product) => ({
      "ID товара": product.productId,
      ...getCategories(product),
      "Параметр: Дата выхода": product.saleDate,
      "Название товара или услуги": product.title,
      "Изображение варианта": product.images?.join(" "),
      "Краткое описание": undefined,
      "Полное описание": product.description,
      Изображения: product.images?.join(" "),
      "Цена продажи": product.price,
      Артикул: product.vendorCode,
      ...getParams(product),
      ...getProperties(product),
    }));
    const workBook = xlsx.utils.book_new();
    const productsWorkSheet = xlsx.utils.json_to_sheet(data);

    xlsx.utils.book_append_sheet(workBook, productsWorkSheet, "products");

    return xlsx.write(workBook, { bookType: "xlsx", type: "buffer" });
  }
}
