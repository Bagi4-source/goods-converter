import {IProduct, type Formatter} from "../types";
import {ICategory} from "../types/ICategory";
import {json2csv} from "json-2-csv";

export class CSV implements Formatter {
    async export(products: IProduct[], categoryList?: ICategory[]): Promise<Buffer> {
        const name = "Bagi4";
        const company = "Bagi4";
        const categories = {
            category: categoryList?.map(cat => ({
                "@_id": cat.id, "@_parentId": cat.parentId, "#text": cat.name
            }))
        };
        const offers = {"offer": this.getOffers(products)};
        const result = {
            "?xml": {
                "@_version": '1.0',
                "@_encoding": 'UTF-8',
                "@_standalone": 'yes'
            },
            "yml_catalog": {
                "shop": {
                    name,
                    company,
                    categories,
                    offers
                }
            }
        };

        return Buffer.from(json2csv(products, {emptyFieldValue: ""}), "utf-8")
    }

    private getOffers(data: IProduct[]) {
        return data.map(product => {
            const result = {
                "@_id": product.variantId,
                "name": product.title,
                "price": product.price,
                "oldprice": product.oldPrice,
                "purchase_price": product.purchasePrice,
                "currencyId": "RUB",
                "categoryId": product.categoryId,
                "vendor": product.vendor,
                "vendorCode": product.vendorCode,
                "picture": product.images,
                "available": product.available,
                "param": product.params?.map(param => ({
                    "#text": param.value,
                    "@_name": param.key
                })),
                "description": product.description,
                "country_of_origin": product.countryOfOrigin,
                "barcode": product.barcode,
                "vat": product.vat,
                "count": product.count
            };
            if (product.parentId)
                return {
                    ...result,
                    "@_group_id": product.parentId
                };
            return result;
        })
    }
}

