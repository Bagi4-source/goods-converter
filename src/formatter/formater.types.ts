import { type Brand, type Category, type Product } from "../types";

import { type Readable } from "stream";

export abstract class FormatterAbstract {
  public abstract formatterName: string;
  public abstract fileExtension: Extension;

  public abstract format(
    products: Product[],
    categories?: Category[],
    brands?: Brand[],
    option?: FormatterOptions,
  ): Promise<Readable>;
}

export interface FormatterOptions {
  shopName?: string;

  companyName?: string;

  splitParams?: boolean;
}

export enum Extension {
  CSV = "csv",
  YML = "yml",
  XLSX = "xlsx",
  JSON = "json",
}
