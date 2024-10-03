import { CSVFormatter } from "./CSV.formatter";
import { ExcelFormatter } from "./Excel.formatter";
import { InsalesFormatter } from "./Insales.formatter";
import { JSONFormatter } from "./JSON.formatter";
import { SimpleJSONFormatter } from "./SimpleJSON.formatter";
import { TgShopFormatter } from "./TgShop.formatter";
import { TildaFormatter } from "./Tilda.formatter";
import { XMLFormatter } from "./XML.formatter";
import { YMLFormatter } from "./YML.formatter";

export * from "./formater.types";

export const Formatters = {
  TildaFormatter,
  CSVFormatter,
  InsalesFormatter,
  YMLFormatter,
  TgShopFormatter,
  ExcelFormatter,
  JSONFormatter,
  SimpleJSONFormatter,
  XMLFormatter,
};
