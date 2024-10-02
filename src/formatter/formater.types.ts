import { type Brand, type Category, type Product } from "../types";

import { type Writable } from "stream";

export abstract class FormatterAbstract {
  public abstract formatterName: string;
  public abstract fileExtension: Extension;

  public abstract format(
    writableStream: Writable,
    products: Product[],
    categories?: Category[],
    brands?: Brand[],
    option?: FormatterOptions,
  ): Promise<void>;
}

export interface FormatterOptions {
  shopName?: string;

  companyName?: string;

  splitParams?: boolean;
}

export enum Extension {
  CSV = "csv",
  YML = "yml",
  XML = "xml",
  XLSX = "xlsx",
  JSON = "json",
}
