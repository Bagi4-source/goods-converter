import { type Category, Currency, type Product, Vat } from '../src'

export const products: Product[] = [
  {
    productId: 1,
    variantId: 1111,
    title: 'Title',
    description: 'Description',
    vendor: 'Nike',
    vendorCode: 'NIKE-1111',
    saleDate: '01.01.2020',
    categoryId: 1,
    countryOfOrigin: 'Китай',
    images: ['image1', 'image2'],
    videos: [],
    price: 19000,
    oldPrice: 20000,
    additionalExpenses: 1000,
    purchasePrice: 15000,
    cofinancePrice: 0,
    currency: Currency.RUR,
    url: undefined,
    minQuantity: 1,
    stepQuantity: 1,
    disabled: false,
    available: true,
    codesTN: ['code'],
    barcode: '567890567893',
    weight: 0.15,
    boxCount: 1,
    dimensions: '12/32/43',
    vat: Vat.VAT_20,
    count: 24,
    params: [{
      key: 'param1',
      value: 'v1'
    }, {
      key: 'param2',
      value: 'v2'
    }],
    properties: [{
      key: 'prop1',
      value: 'v1'
    }, {
      key: 'prop2',
      value: 'v2'
    }],
    age: {
      unit: 'year',
      value: 6
    },
    tags: ['Nike', 'Кроссовки'],
    adult: false,
    downloadable: false,
    validityPeriod: '',
    validityComment: '',
    serviceLifePeriod: '',
    serviceLifeComment: '',
    warrantyPeriod: '',
    warrantyComment: '',
    manufacturerWarranty: true,
    certificate: '111'
  }, {
    productId: 1,
    parentId: 1111,
    variantId: 1112,
    title: 'Title',
    description: 'Description',
    vendor: 'Nike',
    vendorCode: 'NIKE-1111',
    saleDate: '01.01.2020',
    categoryId: 1,
    countryOfOrigin: 'Китай',
    images: ['image1', 'image2'],
    videos: [],
    price: 19000,
    oldPrice: 20000,
    additionalExpenses: 1000,
    purchasePrice: 15000,
    cofinancePrice: 0,
    currency: Currency.RUR,
    url: undefined,
    minQuantity: 1,
    stepQuantity: 1,
    disabled: false,
    available: true,
    codesTN: ['code'],
    barcode: '567890567893',
    weight: 0.15,
    boxCount: 1,
    dimensions: '12/32/43',
    vat: Vat.VAT_20,
    count: 24,
    params: [{
      key: 'p1',
      value: 'v1'
    }, {
      key: 'p2',
      value: 'v2'
    }],
    age: {
      unit: 'year',
      value: 6
    },
    tags: ['Nike', 'Кроссовки'],
    adult: false,
    downloadable: false,
    validityPeriod: '',
    validityComment: '',
    serviceLifePeriod: '',
    serviceLifeComment: '',
    warrantyPeriod: '',
    warrantyComment: '',
    manufacturerWarranty: true,
    certificate: '111'
  }
]
export const categories: Category[] = [
  { id: 1, parentId: 2, name: 'Обувь' },
  { id: 2, parentId: 3, name: 'Одежда, обувь и аксессуары' },
  { id: 3, name: 'Все товары' }
]