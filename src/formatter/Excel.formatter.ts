import { type Category, type Product } from '../types'
import { Extension, type FormatterAbstract, type FormatterOptions } from './formater.types'
import { writeXLSX, utils } from 'xlsx'

export class ExcelFormatter implements FormatterAbstract {
  public formatterName = 'Excel'
  public fileExtension = Extension.XLSX

  public async format (products: Product[], categories?: Category[], option?: FormatterOptions): Promise<Buffer> {
    const mappedCategories: Record<number, string> = {}
    categories?.forEach(({ id, name }) => (mappedCategories[id] = name))

    const getParams = (product: Product): Record<string, string> => {
      const params: Record<string, string> = {}
      product.params?.forEach(({ key, value }) => (params[`Param [${key}]`] = value))
      return params
    }

    const getProperties = (product: Product): Record<string, string> => {
      const properties: Record<string, string> = {}
      product.properties?.forEach(({ key, value }) => (properties[`Property [${key}]`] = value))
      return properties
    }

    const data = products.map(product => ({
      ...product,
      category: mappedCategories[product.categoryId],
      images: product.images?.join(','),
      videos: product.videos?.join(','),
      tags: product.tags?.join(','),
      codesTN: product.codesTN?.join(', '),
      params: product.params?.map(({ key, value }) => `${key}=${value}`).join(','),
      ...getParams(product),
      ...getProperties(product)
    }))
    const workBook = utils.book_new()
    const productsWorkSheet = utils.json_to_sheet(data)

    utils.book_append_sheet(workBook, productsWorkSheet, 'products')
    return writeXLSX(workBook, { type: 'buffer' })
  }
}
