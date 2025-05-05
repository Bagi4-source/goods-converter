import pkg from "exceljs";

import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

const { stream } = pkg;

export class InsalesFormatter implements FormatterAbstract {
  public formatterName = "Insales";
  public fileExtension = Extension.XLSX;

  public async format(
    writableStream: Writable,
    products: Product[],
    categories?: Category[],
    _?: Brand[],
    __?: FormatterOptions,
  ): Promise<void> {
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
    const workbook = new stream.xlsx.WorkbookWriter({
      stream: writableStream,
    });
    const worksheet = workbook.addWorksheet("products");
    const columns = new Set<string>([
      "Внешний ID",
      "Ссылка на товар",
      "Артикул",
      "Корневая",
      "Подкатегория 1",
      "Подкатегория 2",
      "Название товара или услуги",
      "Время доставки: Минимальное",
      "Время доставки: Максимальное",
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
      "Параметр: Артикул",
      "Параметры",
      "Свойства",
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

    for (const product of products) {
      const externalId = `${product.productId}-${product.variantId}`;
      const row = {
        "Внешний ID": externalId,
        "Ссылка на товар": product.url,
        Артикул: externalId, // TODO: product.vendorCode,
        "Название товара или услуги": product.title,
        "Время доставки: Минимальное": product.timeDelivery?.min,
        "Время доставки: Максимальное": product.timeDelivery?.max,
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
        НДС: product.vat?.toString(),
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
        "Параметр: Артикул": product.vendorCode, // TODO: брать из обычных параметров
        ...getParams(product),
        ...getProperties(product),
        "Размерная сетка": JSON.stringify(product.sizes),
        "Связанные товары": product.relatedProducts?.join(","),
        "Ключевые слова": product.keywords?.join(","),
      };
      // todo(delay)
      worksheet.addRow(row).commit();
    }

    worksheet.commit();
    await workbook.commit();
  }
}
