import {Category, Product} from "../types";
import {json2csv} from "json-2-csv";
import {Extension, FormatterAbstract, FormatterOptions} from "./formater.types";

export class CSVFormatter implements FormatterAbstract {
    public formatterName = "CSV";
    public fileExtension = Extension.CSV;


    public async format(products: Product[], categories?: Category[], option?: FormatterOptions): Promise<string> {
        const mappedCategories: Record<number, string> = {};
        categories?.forEach(({id, name}) => mappedCategories[id] = name);

        const getParams = (product: Product) => {
            const params: Record<string, string> = {};

            if (!option?.splitParams)
                return params

            product.params?.forEach(({key, value}) => params[`Param [${key}]`] = value)
            return params
        }
        const data = products.map(product => ({
            ...product,
            category: mappedCategories[product.categoryId],
            images: product.images?.join(","),
            videos: product.videos?.join(","),
            tags: product.tags?.join(","),
            codesTN: product.codesTN?.join(", "),
            params: product.params?.map(({key, value}) => `${key}=${value}`).join(","),
            ...getParams(product)
        }))
        return json2csv(data, {emptyFieldValue: ""})
    }
}

