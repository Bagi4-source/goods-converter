import { XMLBuilder } from "fast-xml-parser";

import { type Product, type Category, type Brand } from "../types";
import { getRFC3339Date, writeWithDrain } from "../utils";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { PassThrough, type Writable } from "stream";

export class YMLFormatter implements FormatterAbstract {
  public formatterName = "YMl";
  public fileExtension = Extension.YML;

  public async format(
    writableStream: Writable,
    products: Product[],
    categories?: Category[],
    brands?: Brand[],
    options?: FormatterOptions,
  ): Promise<void> {
    const result = new PassThrough();
    result.pipe(writableStream);

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      cdataPropName: "__cdata",
      format: true,
      indentBy: "  ",
    });

    const date = getRFC3339Date(new Date());

    // Начинаем формирование XML
    result.write('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n');
    result.write('<yml_catalog date="' + date + '">\n');

    // Открываем тег <shop>
    result.write("<shop>\n");

    const resultWriter = writeWithDrain(result);
    // Добавляем информацию о магазине
    if (options?.shopName) {
      await resultWriter(builder.build({ name: options.shopName }));
      await resultWriter("\n");
    }
    if (options?.companyName) {
      await resultWriter(builder.build({ company: options.companyName }));
      await resultWriter("\n");
    }

    // Добавляем категории и бренды
    if (categories) {
      await resultWriter(
        builder.build({
          // tagname: "categories",
          categories: { category: this.getCategories(categories) },
        }),
      );
      await resultWriter("\n");
    }
    if (brands) {
      await resultWriter(
        builder.build({ brands: { brand: this.getBrands(brands) } }),
      );
      await resultWriter("\n");
    }

    // Открываем секцию <offers>
    await resultWriter("<offers>\n");

    // Создаем поток для обработки offer элементов
    const offerStream = new PassThrough();
    const offerWriter = writeWithDrain(offerStream);

    // Пайпим поток offer элементов в основной итоговый поток
    offerStream.pipe(result, { end: false });

    // Записываем каждый продукт в поток
    for (const product of products) {
      if (product.price === 0) continue;
      const offer = builder.build({ offer: this.getOffer(product) });
      await offerWriter(offer + "\n");
    }

    // Завершаем поток offer
    offerStream.end();

    offerStream.on("end", () => {
      // Закрываем секцию <offers>
      result.write("</offers>\n");

      // Закрываем тег <shop>
      result.write("</shop>\n");

      // Закрываем тег <yml_catalog>
      result.write("</yml_catalog>\n");

      // Завершаем итоговый поток
      result.end();
    });
  }

  private getBrands(brands?: Brand[]) {
    if (!brands) return [];

    return brands.map((brand) => ({
      "@_id": brand.id,
      "@_url": brand.coverURL ?? "",
      "#text": brand.name,
    }));
  }

  private getCategories(categories?: Category[]) {
    if (!categories) return [];

    return categories.map((cat) => ({
      "@_id": cat.id,
      "@_parentId": cat.parentId ?? "",
      "#text": cat.name || `Категория #${cat.id}`,
    }));
  }

  private getOffer(product: Product): any {
    const result = {
      "@_id": product.variantId,
      name: product.title,
      price: product.price,
      oldprice: product.oldPrice,
      purchase_price: product.purchasePrice,
      additional_expenses: product.additionalExpenses,
      cofinance_price: product.cofinancePrice,
      currencyId: product.currency,
      categoryId: product.categoryId,
      vendorId: product.vendorId,
      vendor: product.vendor,
      vendorCode: product.vendorCode,
      picture: product.images,
      video: product.videos,
      available: product.available,
      "time-delivery": product.timeDelivery
        ? {
            "@_min": product.timeDelivery.min,
            "@_max": product.timeDelivery.max,
            "#text": `${product.timeDelivery.min}-${product.timeDelivery.max}`,
          }
        : undefined,
      series: product.seriesName,
      "min-quantity": product.minQuantity,
      "step-quantity": product.stepQuantity,
      size: product.sizes?.map((size) => ({
        "#text": size.value,
        "@_name": size.name,
        "@_delimiter": size.delimiter,
      })),
      keyword: product.keywords,
      saleDate: product.saleDate,
      property: product.properties?.map((property) => ({
        "#text": property.value,
        "@_name": property.key,
      })),
      param: product.params?.map((param) => ({
        "#text": param.value,
        "@_name": param.key,
      })),
      description: {
        __cdata: product.description,
      },
      country_of_origin: product.countryOfOrigin,
      barcode: product.barcode,
      vat: product.vat,
      count: product.count,
      "set-ids": product.tags?.join(", "),
      adult: product.adult,
      downloadable: product.downloadable,
      "period-of-validity-days": product.validityPeriod,
      "comment-validity-days": product.validityComment,
      "service-life-days": product.serviceLifePeriod,
      "comment-life-days": product.serviceLifeComment,
      "warranty-days": product.warrantyPeriod,
      "comment-warranty": product.warrantyComment,
      manufacturer_warranty: product.manufacturerWarranty,
      certificate: product.certificate,
      url: product.url,
      weight: product.weight,
      dimensions: product.dimensions,
      boxCount: product.boxCount,
      disabled: product.disabled,
      age: product.age
        ? {
            "@_unit": product.age.unit,
            "#text": product.age.value,
          }
        : undefined,
      "tn-ved-codes": product.codesTN?.length
        ? {
            "tn-ved-code": product.codesTN,
          }
        : undefined,
      relatedProduct: product.relatedProducts,
      gender: product.gender,
    };
    if (product.parentId !== undefined) {
      return {
        ...result,
        "@_group_id": product.parentId,
      };
    }
    return result;
  }
}
