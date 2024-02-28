import Excel from "exceljs";

import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { PassThrough, type Readable } from "stream";

export class InsalesFormatter implements FormatterAbstract {
  public formatterName = "Insales";
  public fileExtension = Extension.XLSX;

  public async format(
    products: Product[],
    categories?: Category[],
    _?: Brand[],
    __?: FormatterOptions,
  ): Promise<Readable> {
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
    const result = new PassThrough();

    const workbook = new Excel.stream.xlsx.WorkbookWriter({});
    const worksheet = workbook.addWorksheet("products");
    const columns = new Set<string>([
      "Внешний ID",
      "Ссылка на товар",
      "Артикул",
      "Корневая",
      "Подкатегория 1",
      "Подкатегория 2",
      "Название товара или услуги",
      "Старая цена",
      "Цена продажи",
      "Cебестоимость",
      "Категории",
      "Остаток",
      "Штрих-код",
      "Краткое описание",
      "Полное описание",
      "Габариты варианта",
      "Вес",
      "Размещение на сайте",
      "НДС",
      "Валюта склада",
      "Изображения варианта",
      "Изображения",
      "Ссылка на видео",
      "Параметры",
      "Свойства",
      "Параметр: Бренд",
      "Параметр: Коллекция",
      "Параметр: Пол",
      "Параметр: Дата выхода",
      "Размерная сетка",
      "Связанные товары",
      "Ключевые слова",
    ]);
    products.forEach((product) => {
      Object.keys({
        ...getParams(product),
        ...getProperties(product),
      }).forEach((key) => {
        columns.add(key);
      });
    });
    worksheet.columns = Array.from(columns).map((column) => ({
      header: column,
      key: column,
    }));
    products.forEach((product) => {
      const row = {
        "Внешний ID": product.productId,
        "Ссылка на товар": product.url,
        Артикул: product.vendorCode,
        "Название товара или услуги": product.title,
        "Старая цена": product.oldPrice,
        "Цена продажи": product.price,
        Cебестоимость: product.purchasePrice,
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
        "Изображения варианта":
          product.parentId === undefined
            ? product.images?.join(" ")
            : undefined,
        Изображения:
          product.parentId === undefined
            ? undefined
            : product.images?.join(" "),
        "Ссылка на видео": product.videos ? product.videos[0] : undefined,
        ...getParams(product),
        ...getProperties(product),
        "Параметр: Бренд": product.vendor,
        "Параметр: Коллекция": product.seriesName,
        "Параметр: Пол": product.gender,
        "Параметр: Дата выхода": product.saleDate,
        "Размерная сетка": JSON.stringify(product.sizes),
        "Связанные товары": product.relatedProducts?.join(","),
        "Ключевые слова": product.keywords?.join(","),
      };
      worksheet.addRow(row).commit();
    });
    worksheet.commit();
    await workbook.commit();
    // @ts-ignore
    workbook.stream.pipe(result);
    return result;
  }
}
