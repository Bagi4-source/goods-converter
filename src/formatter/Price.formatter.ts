import { JsonStreamStringify } from "json-stream-stringify";

import type { Brand, Category, Currency, Product } from "../types";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "./formater.types";

import { type Writable } from "stream";

interface PriceSku {
  skuId: string;
  price: number;
  currency: Currency;
  timeDelivery?: {
    min: number;
    max: number;
  };
}

interface PriceProduct {
  productId: number;
  skus: PriceSku[];
}

export class PriceFormatter implements FormatterAbstract {
  public formatterName = "Price";
  public fileExtension = Extension.JSON;

  public async format(
    writableStream: Writable,
    products: Product[],
    _categories?: Category[],
    _brands?: Brand[],
    _?: FormatterOptions,
  ): Promise<void> {
    const priceMap = new Map<number, PriceProduct>();

    products.forEach((product) => {
      const existing = priceMap.get(product.productId);
      const sku: PriceSku = {
        skuId: String(product.variantId),
        price: product.price,
        currency: product.currency,
      };

      if (
        product.timeDelivery?.min !== undefined ||
        product.timeDelivery?.max !== undefined
      ) {
        sku.timeDelivery = {
          min: product.timeDelivery.min ?? 0,
          max: product.timeDelivery.max ?? 0,
        };
      }

      if (existing) {
        existing.skus.push(sku);
      } else {
        priceMap.set(product.productId, {
          productId: product.productId,
          skus: [sku],
        });
      }
    });

    const result: PriceProduct[] = Array.from(priceMap.values());
    const stream = new JsonStreamStringify(result);
    stream.pipe(writableStream);
  }
}
