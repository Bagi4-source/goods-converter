import { type Category, type Product } from "../types";

export abstract class FormatterAbstract {
  public abstract formatterName: string;
  public abstract fileExtension: Extension;

  public abstract format(
    products: Product[],
    categories?: Category[],
    option?: FormatterOptions,
  ): Promise<Buffer | string>;
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
