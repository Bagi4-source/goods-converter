import {Category, Product} from "../types";
import {json2csv} from "json-2-csv";
import {Extension, FormatterAbstract, FormatterOptions} from "./formater.types";
import {s} from "@vitest/runner/dist/tasks-e594cd24";

export class TildaFormatter implements FormatterAbstract {
    public formatterName = "Tilda";
    public fileExtension = Extension.CSV;

    public async format(products: Product[], categories?: Category[], option?: FormatterOptions): Promise<string> {
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
        // toDo(add characteristics)
        return json2csv(data, {emptyFieldValue: "", delimiter: {field: ";"}})
    }
}

