import { AvitoFormatter } from "./avito";
import { CSVFormatter } from "./CSV.formatter";
import { ExcelFormatter } from "./Excel.formatter";
import { InsalesFormatter } from "./Insales.formatter";
import { JSONFormatter } from "./JSON.formatter";
import { PriceFormatter } from "./Price.formatter";
import { SimpleJSONFormatter } from "./SimpleJSON.formatter";
import { TgShopFormatter } from "./TgShop.formatter";
import { TildaFormatter } from "./Tilda.formatter";
import { WooCommerceFormatter } from "./WooCommerce.formatter";
import { XMLFormatter } from "./XML.formatter";
import { YMLFormatter } from "./YML.formatter";

export * from "./formater.types";
export * from "./avito";

export const Formatters = {
  AvitoFormatter,
  TildaFormatter,
  CSVFormatter,
  InsalesFormatter,
  YMLFormatter,
  TgShopFormatter,
  ExcelFormatter,
  JSONFormatter,
  SimpleJSONFormatter,
  XMLFormatter,
  WooCommerceFormatter,
  PriceFormatter,
};
