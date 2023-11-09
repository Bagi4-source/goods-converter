import {XMLBuilder} from "fast-xml-parser";
import {Product, Category} from "../types";
import {Extension, Formatter, FormatterOptions} from "./formater.types";


export class YMLFormatter implements Formatter {
    formatterName = "YMl";
    fileExtension = Extension.YML;
    builder = new XMLBuilder({ignoreAttributes: false, cdataPropName: '__cdata',});

    async format(products: Product[], categories?: Category[], options?: FormatterOptions): Promise<string> {
        const mappedCategories = {
            category: categories?.map(cat => ({
                "@_id": cat.id, "@_parentId": cat.parentId, "#text": cat.name
            }))
        };
        const shopName = options?.shopName ?? "ShopName";
        const companyName = options?.companyName ?? "CompanyName";
        const offers = {"offer": products.map(this.getOffers)};
        const result = {
            "?xml": {
                "@_version": '1.0',
                "@_encoding": 'UTF-8',
                "@_standalone": 'yes'
            },
            "yml_catalog": {
                "@_date": new Date().toISOString().replace(/.\d+Z/, ''),
                "shop": {
                    name: shopName,
                    company: companyName,
                    categories: mappedCategories,
                    offers
                }
            }
        };

        return this.builder.build(result);
    }

    private getOffers(product: Product) {
        const result = {
            "@_id": product.variantId,
            "name": product.title,
            "price": product.price,
            "oldprice": product.oldPrice,
            "purchase_price": product.purchasePrice,
            "additional_expenses": product.additionalExpenses,
            "cofinance_price": product.cofinancePrice,
            "currencyId": product.currency,
            "categoryId": product.categoryId,
            "vendor": product.vendor,
            "vendorCode": product.vendorCode,
            "picture": product.images,
            "video": product.videos,
            "available": product.available,
            "min-quantity": product.minQuantity,
            "step-quantity": product.stepQuantity,
            "param": product.params?.map(param => ({
                "#text": param.value,
                "@_name": param.key
            })),
            "description": {
                __cdata: product.description
            },
            "country_of_origin": product.countryOfOrigin,
            "barcode": product.barcode,
            "vat": product.vat,
            "count": product.count,
            "set-ids": product.tags?.join(", "),
            "adult": product.adult,
            "downloadable": product.downloadable,
            "period-of-validity-days": product.validityPeriod,
            "comment-validity-days": product.validityComment,
            "service-life-days": product.serviceLifePeriod,
            "comment-life-days": product.serviceLifeComment,
            "warranty-days": product.warrantyPeriod,
            "comment-warranty": product.warrantyComment,
            "manufacturer_warranty": product.manufacturerWarranty,
            "certificate": product.certificate,
            "url": product.url,
            "weight": product.weight,
            "dimensions": product.dimensions,
            "boxCount": product.boxCount,
            "disabled": product.disabled,
            "age": product.age && {
                "@_unit": product.age.unit,
                "#text": product.age.value,
            },
            "tn-ved-codes": product.codesTN?.length && {
                "tn-ved-code": product.codesTN
            }
        };
        if (product.parentId)
            return {
                ...result,
                "@_group_id": product.parentId
            };
        return result;
    }
}

