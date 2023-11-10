import { type Category, type Product } from '../types'
import xlsx from 'xlsx'
import { Extension, type FormatterAbstract, type FormatterOptions } from './formater.types'

export class CSVFormatter implements FormatterAbstract {
  public formatterName = 'TgShop'
  public fileExtension = Extension.XLSX

  public async format (products: Product[], categories?: Category[], option?: FormatterOptions): Promise<string> {
    const mappedCategories: Record<number, string> = {}
    categories?.forEach(({ id, name }) => (mappedCategories[id] = name))

    const getParams = (product: Product): Record<string, string> => {
      const params: Record<string, string> = {}

      if ((option?.splitParams) === false) { return params }

      product.params?.forEach(({ key, value }) => (params[`Param [${key}]`] = value))
      return params
    }

    const data = products.map(product => ({
      ...product,
      category: mappedCategories[product.categoryId],
      images: product.images?.join(','),
      videos: product.videos?.join(','),
      tags: product.tags?.join(','),
      codesTN: product.codesTN?.join(', '),
      params: product.params?.map(({ key, value }) => `${key}=${value}`).join(','),
      ...getParams(product)
    }))

    const workBook = xlsx.utils.book_new()
    const productsWorkSheet = xlsx.utils.json_to_sheet(data)
    const categoriesWorkSheet = xlsx.utils.json_to_sheet(data)

    xlsx.utils.book_append_sheet(workBook, productsWorkSheet, 'offers')
    xlsx.utils.book_append_sheet(workBook, categoriesWorkSheet, 'categories')

    return xlsx.write(workBook, { bookType: 'xlsx', type: 'string' })
  }
}
