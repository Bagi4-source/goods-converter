import {Formatter, FormatterOptions, Formatters} from "../formatter";
import {Exporter, Transformer} from "./exporter.types";
import {Category, Product} from "../types";
import deepcopy from "deepcopy";
import * as fs from "fs";

export class GoodsExporter {
    private formatter: Formatter = Formatters.YML
    private exporter: Exporter = (data: Buffer) => fs.writeFileSync("output.yml", data)

    private transformers = new Array<Transformer>()


    setTransformers(transformers: Transformer[]) {
        this.transformers = transformers
    }

    setFormatter(formatter: Formatter) {
        this.formatter = formatter
    }

    setExporter(formatter: Exporter) {
        this.exporter = formatter
    }

    async export(products: Product[], categories?: Category[], option?: FormatterOptions): Promise<void> {
        const transformedProducts = deepcopy(products).map(product => {
            let transformedProduct: Product = product;
            this.transformers.forEach(transformer => {
                transformedProduct = transformer(transformedProduct)
            })
            return transformedProduct
        })
        const data = await this.formatter.format(transformedProducts, categories, option);
        this.exporter(Buffer.from(data, "utf-8"))
    }
}