import { type Product } from "../types";

import { type Writable } from "stream";

export type Transformer<Context = object | undefined> = (
  products: Product[],
  context: Context,
) => Product[] | Promise<Product[]>;
export type Exporter = () => Writable;
