import { type Category, type Product } from '../types'
import { Extension, type FormatterAbstract, type FormatterOptions } from './formater.types'
import xlsx from 'xlsx'

export class InsalesFormatter implements FormatterAbstract {
  public formatterName = 'Insales'
  public fileExtension = Extension.XLSX

  public async format (products: Product[], categories?: Category[], option?: FormatterOptions): Promise<string> {
    const mappedCategories: Record<number, string> = {}
    categories?.forEach(({ id, name }) => (mappedCategories[id] = name))

    const getParams = (product: Product): Record<string, string> => {
      const properties: Record<string, string> = {}

      product.params?.forEach(p => (properties[`Параметр: ${p.key}`] = p.value))

      return properties
    }
    const getProperties = (product: Product): Record<string, string> => {
      const properties: Record<string, string> = {}

      product.properties?.forEach(p => (properties[`Свойство: ${p.key}`] = p.value))

      return properties
    }

    const data = products.map(product => ({
      'Параметр: Дата выхода': product.saleDate,
      'Название товара или услуги': product.title,
      'Изображение варианта': product.images?.join(' '),
      'Краткое описание': undefined,
      'Полное описание': product.description,
      Изображения: product.images?.join(' '),
      'Цена продажи': product.price,
      Артикул: product.vendorCode,
      ...getParams(product),
      ...getProperties(product)
    }))
    const workBook = xlsx.utils.book_new()
    const productsWorkSheet = xlsx.utils.json_to_sheet(data)

    xlsx.utils.book_append_sheet(workBook, productsWorkSheet, 'products')

    return xlsx.write(workBook, { bookType: 'xlsx', type: 'buffer' }).toString()
  }
}
