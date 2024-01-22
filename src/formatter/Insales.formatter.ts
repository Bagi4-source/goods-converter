import xlsx from "xlsx";

import { type Brand, type Category, type Product } from "../types";
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
    _?: Brand[],
    __?: FormatterOptions,
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

    const getSizes = (product: Product): Record<string, string> => {
      const sizes: Record<string, string> = {};

      product.sizes?.forEach(
        ({ name, value }) => (sizes[`Размеры [${name}]:`] = value),
      );

      return sizes;
    };

    const getCategories = (product: Product) => {
      const categories: Record<string, string> = {};
      const categoryList = new Array<string>();

      function addCategory(categoryId: number | undefined) {
        if (categoryId === undefined) return;

        const category = mappedCategories[categoryId];
        if (category) {
          categoryList.push(category.name);
          addCategory(category.parentId);
        }
      }

      addCategory(product.categoryId);

      categoryList.forEach((name, i) => {
        const index = categoryList.length - 1 - i;
        const key = index === 0 ? "Корневая" : `Подкатегория ${index}`;
        categories[key] = name;
      });

      return categories;
    };

    const data = products.map((product) => ({
      "Внешний ID": product.productId,
      Артикул: product.vendorCode,
      "Название товара или услуги": product.title,
      "Старая цена": product.oldPrice,
      "Цена продажи": product.price,
      "Цена закупки": product.purchasePrice,
      ...getCategories(product),
      Остаток: product.count,
      "Штрих-код": product.barcode,
      "Краткое описание": undefined,
      "Полное описание": product.description,
      "Габариты варианта": product.dimensions,
      Вес: product.weight,
      "Размещение на сайте": product.available,
      НДС: product.vat.toString(),
      "Валюта склада": product.currency.toString(),
      "Изображения варианта": product.images?.join(" "),
      Изображения: product.images?.join(" "),
      "Ссылка на видео": product.videos ? product.videos[0] : undefined,
      ...getParams(product),
      ...getProperties(product),
      "Параметр: Бренд": product.vendor,
      "Параметр: Коллекция": product.seriesName,
      "Параметр: Пол": product.gender,
      "Параметр: Дата выхода": product.saleDate,
      ...getSizes(product),
      "Связанные товары": product.relatedProducts?.join(","),
    }));
    const workBook = xlsx.utils.book_new();
    const productsWorkSheet = xlsx.utils.json_to_sheet(data);

    xlsx.utils.book_append_sheet(workBook, productsWorkSheet, "products");

    return xlsx.write(workBook, { bookType: "xlsx", type: "buffer" });
  }
}
