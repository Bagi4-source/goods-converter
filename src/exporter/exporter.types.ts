import { type Product } from "../types";

import { type Writable } from "stream";

export type Transformer = (
  products: Product[],
) => Product[] | Promise<Product[]>;
export type Exporter = () => Writable;
