import {Category, Product} from "../types";
import {json2csv} from "json-2-csv";
import {Extension, Formatter, FormatterOptions} from "./formater.types";

export class TildaFormatter implements Formatter {
    formatterName = "Tilda";
    fileExtension = Extension.CSV;

    async format(products: Product[], categories?: Category[], option?: FormatterOptions): Promise<string> {
        const mappedCategories: Record<number, string> = {};
        categories?.forEach(({id, name}) => mappedCategories[id] = name);

        const data = products.map(product => ({
            SKU: product.vendorCode,
            Brand: product.vendor,
            Category: mappedCategories[product.categoryId],
            Title: product.title,
            Text: product.description,
            Photo: product.images?.join(";"),
            Price: product.price,
            "Price Old": product.oldPrice,
            Quantity: product.count,
            Editions: product.params?.map(({key, value}) => `${key}:${value}`).join(";"),
            "External ID": product.variantId,
            "Parent UID": product.parentId
        }))
        return json2csv(data, {emptyFieldValue: "", delimiter: {field: ";"}})
    }
}

