import { type Category, type IParam, type Product } from '../types'
import xlsx from 'xlsx'
import { Extension, type FormatterAbstract, type FormatterOptions } from './formater.types'

export class TgShopFormatter implements FormatterAbstract {
  public formatterName = 'TgShop'
  public fileExtension = Extension.XLSX

  public async format (products: Product[], categories?: Category[], option?: FormatterOptions): Promise<Buffer> {
    const getParameter = (product: Product, key: string): IParam | undefined => product.params?.find((value) => (value.key === key))
    const productsData = products.map(product => ({
      'category id': product.categoryId,
      'group id': product.parentId,
      'id product': product.variantId,
      'name product': product.title,
      price: product.price,
      picture: product.images?.join(', '),
      vendorCode: product.vendorCode,
      oldprice: product.oldPrice,
      description: product.description,
      shortDescription: product.description,
      quantityInStock: product.count,
      color: getParameter(product, 'color')?.value,
      size: getParameter(product, 'size')?.value,
      priority: undefined
    }))

    const workBook = xlsx.utils.book_new()
    const productsWorkSheet = xlsx.utils.json_to_sheet(productsData)
    const categoriesWorkSheet = xlsx.utils.json_to_sheet(categories ?? [])

    xlsx.utils.book_append_sheet(workBook, productsWorkSheet, 'offers')
    xlsx.utils.book_append_sheet(workBook, categoriesWorkSheet, 'categories')

    return xlsx.write(workBook, { bookType: 'xlsx', type: 'buffer' })
  }
}
