import {Category, Product} from "../types";

export abstract class FormatterAbstract {
    public abstract formatterName: string;
    public abstract fileExtension: Extension;

    public abstract format(products: Product[], categories?: Category[], option?: FormatterOptions): Promise<string>;
}

export interface FormatterOptions {
    shopName?: string
    companyName?: string
    splitParams?: boolean
}


export enum Extension {
    CSV = "CSV",
    YML = "YML",
    XLSX = "XLSX"
}
