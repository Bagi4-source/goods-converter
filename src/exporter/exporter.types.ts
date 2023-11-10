import { type Product } from '../types'

export type Transformer = (product: Product) => Product
export type Exporter = (data: Buffer) => any | Promise<any>
