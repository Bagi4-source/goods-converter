export interface IProduct {
    productId: number,
    parentId?: number,
    variantId: number,
    title: string,
    description: string,
    vendor?: string,
    vendorCode?: string,
    categoryId: number,
    countryOfOrigin?: string,
    images?: string[],
    price?: number,
    oldPrice?: number,
    purchasePrice?: number,
    available?: boolean,
    barcode?: string,
    weight?: number,
    dimensions?: string,
    vat: Vat,
    count?: number,
    params?: IParam[]
}

export enum Vat {
    NO_VAT = "NO_VAT",
    VAT_0 = "VAT_0",
    VAT_10 = "VAT_10",
    VAT_20 = "VAT_20"
}

export interface IParam {
    key: string,
    value: string
}