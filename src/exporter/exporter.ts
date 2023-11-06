import {Formatter, FormatterOptions, Formatters} from "../formatter";
import {Transformer} from "./exporter.types";
import {Category, Product} from "../types";
import deepcopy from "deepcopy";

export class Exporter {
    private formatter: Formatter = Formatters.YML
    private transformers = new Array<Transformer>()


    setTransformers(transformers: Transformer[]) {
        this.transformers = transformers
    }

    setFormatter(formatter: Formatter) {
        this.formatter = formatter
    }

    async export(products: Product[], categories?: Category[], option?: FormatterOptions): Promise<string> {
        const transformedProducts = deepcopy(products).map(product => {
            let transformedProduct: Product = product;
            this.transformers.forEach(transformer => {
                transformedProduct = transformer(transformedProduct)
            })
            return transformedProduct
        })
        return this.formatter.format(transformedProducts, categories, option)
    }
}