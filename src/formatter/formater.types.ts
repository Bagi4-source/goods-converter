import {YMLFormatter} from "./YML.formatter";
import {Category, Product} from "../types";
import {CSVFormatter} from "./CSV.formatter";

export interface Formatter {
    format(products: Product[], categories?: Category[], option?: FormatterOptions): Promise<string>;
}

export interface FormatterOptions {
    shopName?: string
    companyName?: string
    splitParams?: boolean
}

export const Formatters = {
    CSV: new CSVFormatter(),
    YML: new YMLFormatter(),
}

