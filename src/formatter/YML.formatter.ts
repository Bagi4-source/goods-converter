import { XMLBuilder } from "fast-xml-parser";

import { type Product, type Category, type Brand } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { PassThrough, type Stream } from "stream";

export class YMLFormatter implements FormatterAbstract {
  public formatterName = "YMl";
  public fileExtension = Extension.YML;

  public async format(
    products: Product[],
    categories?: Category[],
    brands?: Brand[],
    options?: FormatterOptions,
  ): Promise<Stream> {
    const result = new PassThrough();

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      cdataPropName: "__cdata",
      format: true,
      indentBy: "  ",
    });

    const date = new Date().toISOString().replace(/.\d+Z/, "");

    // Начинаем формирование XML
    result.write('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n');
    result.write('<yml_catalog date="' + date + '">\n');

    // Открываем тег <shop>
    result.write("<shop>\n");

    // Добавляем информацию о магазине
    if (options?.shopName) {
      result.write(builder.build({ name: options.shopName }));
      result.write("\n");
    }
    if (options?.companyName) {
      result.write(builder.build({ company: options.companyName }));
      result.write("\n");
    }

    // Добавляем категории и бренды
    if (categories) {
      result.write(
        builder.build({
          // tagname: "categories",
          categories: { category: this.getCategories(categories) },
        }),
      );
      result.write("\n");
    }
    if (brands) {
      result.write(
        builder.build({ brands: { brand: this.getBrands(brands) } }),
      );
      result.write("\n");
    }

    // Открываем секцию <offers>
    result.write("<offers>\n");

    // Создаем поток для обработки offer элементов
    const offerStream = new PassThrough();

    // Пайпим поток offer элементов в основной итоговый поток
    offerStream.pipe(result, { end: false });

    // Записываем каждый продукт в поток
    products.forEach((product) => {
      const offer = builder.build({ offer: this.getOffer(product) });
      offerStream.write(offer + "\n");
    });

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

    return result;
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
      "#text": cat.name,
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
      age: product.age != null && {
        "@_unit": product.age.unit,
        "#text": product.age.value,
      },
      "tn-ved-codes": product.codesTN?.length != null && {
        "tn-ved-code": product.codesTN,
      },
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
