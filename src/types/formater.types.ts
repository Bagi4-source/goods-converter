import {IProduct} from "./IProduct";
import {CSV} from "../Formetter/CSV";
import {YML} from "../Formetter/YML";

export interface Formatter {
    export: (data: IProduct[]) => Promise<String>;
}

export const Formatters = {
    CSV: new CSV(),
    YML: new YML(),
}

export enum FormatterTypes {
    CSV = "CSV",
    YML = "YML",
}

