import { Formatters } from "../formatter";
import deepcopy from "deepcopy";
export class Exporter {
    constructor() {
        this.formatter = Formatters.YML;
        this.transformers = new Array();
    }
    setTransformers(transformers) {
        this.transformers = transformers;
    }
    setFormatter(formatter) {
        this.formatter = formatter;
    }
    async export(products, categories, option) {
        const transformedProducts = deepcopy(products).map(product => {
            let transformedProduct = product;
            this.transformers.forEach(transformer => {
                transformedProduct = transformer(transformedProduct);
            });
            return transformedProduct;
        });
        return this.formatter.format(transformedProducts, categories, option);
    }
}
//# sourceMappingURL=exporter.js.map