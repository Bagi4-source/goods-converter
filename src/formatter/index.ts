import { TildaFormatter } from './Tilda.formatter'
import { CSVFormatter } from './CSV.formatter'
import { InsalesFormatter } from './Insales.formatter'
import { YMLFormatter } from './YML.formatter'
import { TgShopFormatter } from './TgShop.formatter'
import { ExcelFormatter } from './Excel.formatter'

export * from './formater.types'

export const Formatters = {
  TildaFormatter,
  CSVFormatter,
  InsalesFormatter,
  YMLFormatter,
  TgShopFormatter,
  ExcelFormatter
}
