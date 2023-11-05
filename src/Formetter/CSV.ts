import {IProduct, type Formatter, ICategory} from "../types";
import {json2csv} from "json-2-csv";

export class CSV implements Formatter {
    async export(products: IProduct[], splitParams?: boolean): Promise<String> {
        const getParams = (product: IProduct) => {
            if (splitParams) {
                const params: Record<string, any> = {};
                product.params?.forEach(({key, value}) => params[`Param [${key}]`] = value)
                return params
            }
            return {
                params: product.params?.map(({key, value}) => `${key}=${value}`).join(",")
            }
        }
        const data = products.map(product => ({
            ...product,
            images: product.images?.join(","),
            videos: product.videos?.join(","),
            tags: product.tags?.join(","),
            codesTN: product.codesTN?.join(", "),
            ...getParams(product)
        }))
        return json2csv(data, {emptyFieldValue: ""})
    }
}

