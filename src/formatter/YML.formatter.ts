import { XMLBuilder } from "fast-xml-parser";
import xml from "xml";

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
    });

    const ymlCatalog = xml.element({
      _attr: { date: new Date().toISOString().replace(/.\d+Z/, "") },
    });
    const stream = xml(
      { yml_catalog: ymlCatalog },
      {
        stream: true,
        declaration: { standalone: "yes", encoding: "UTF-8" },
      },
    );
    stream.pipe(result, { end: false });

    const shop = xml.element();
    const streamShop = xml({ shop }, { stream: true });
    shop.push({ name: options?.shopName });
    shop.push({ company: options?.companyName });
    shop.push({ categories: this.getCategories(categories) });
    shop.push({ brands: this.getBrands(brands) });
    streamShop.pipe(result, { end: false });

    const offers = xml.element();
    const streamOffersTag = xml({ offers }, { stream: true });
    streamOffersTag.pipe(result, { end: false });

    const streamOffers = new PassThrough();

    products.forEach((product) => {
      streamOffers.write(builder.build({ offer: this.getOffer(product) }));
    });
    streamOffers.pipe(result, { end: false });

    offers.close();
    shop.close();
    ymlCatalog.close();
    return result;
  }

  private getBrands(brands?: Brand[]) {
    return brands?.map((brand) => ({
      brand: [
        { _attr: { id: brand.id, url: brand.coverURL ?? "" } },
        brand.name,
      ],
    }));
  }

  private getCategories(categories?: Category[]) {
    return categories?.map((cat) => ({
      category: [
        { _attr: { id: cat.id, parentId: cat.parentId ?? "" } },
        cat.name,
      ],
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
