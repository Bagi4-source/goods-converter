import { JsonStreamStringify } from "json-stream-stringify";

import { type Brand, type Category, type Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

interface SimpleProduct extends Product {
  children: Product[];
}

export class SimpleJSONFormatter implements FormatterAbstract {
  public formatterName = "JSON";
  public fileExtension = Extension.JSON;

  public async format(
    writableStream: Writable,
    products: Product[],
    categories?: Category[],
    brands?: Brand[],
    _?: FormatterOptions,
  ): Promise<void> {
    const groupedProduct = new Map<number, SimpleProduct>();
    products.forEach((product) => {
      if (product.parentId !== undefined) return;
      groupedProduct.set(product.variantId, {
        ...product,
        children: [],
      });
    });
    products.forEach((product) => {
      if (product.parentId === undefined) return;
      const parent = groupedProduct.get(product.parentId);
      if (!parent) return;
      parent.children.push(product);
    });
    const stream = new JsonStreamStringify({
      categories,
      brands,
      products: Array.from(groupedProduct.values()),
    });
    stream.pipe(writableStream);
  }
}
