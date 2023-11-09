import {Category, Product} from "../types";
import {YMLFormatter} from "./YML.formatter";
import {CSVFormatter} from "./CSV.formatter";
import {TildaFormatter} from "./Tilda.formatter";

export interface Formatter {
    formatterName: string;
    fileExtension: Extension;
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
    Tilda: new TildaFormatter(),
}


export enum Extension {
    CSV = "csv",
    YML = "yml",
    XLSX = "xlsx",
}
