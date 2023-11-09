import {Formatter, FormatterOptions, Formatters} from "../formatter";
import {Exporter, Transformer} from "./exporter.types";
import {Category, Product} from "../types";
import deepcopy from "deepcopy";
import * as fs from "fs";

export class GoodsExporter {
    private formatter: Formatter = Formatters.YML
    private exporter: Exporter = (data: Buffer) => {
        fs.writeFileSync("output.yml", data);
        return data;
    };

    private transformers = new Array<Transformer>()


    setTransformers(transformers: Transformer[]) {
        this.transformers = transformers
    }

    setFormatter(formatter: Formatter) {
        this.formatter = formatter
    }

    setExporter(exporter: Exporter) {
        this.exporter = exporter
    }

    async export<T>(products: Product[], categories?: Category[], option?: FormatterOptions): Promise<T> {
        const transformedProducts = deepcopy(products).map(product => {
            let transformedProduct: Product = product;
            this.transformers.forEach(transformer => {
                transformedProduct = transformer(transformedProduct)
            })
            return transformedProduct
        })
        const data = await this.formatter.format(transformedProducts, categories, option);
        return this.exporter(Buffer.from(data, "utf-8"))
    }
}