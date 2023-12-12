import { type Product } from "../types";

export type Transformer = (product: Product) => Product | Promise<Product>;
export type Exporter = (data: Buffer) => Buffer | Promise<Buffer>;
