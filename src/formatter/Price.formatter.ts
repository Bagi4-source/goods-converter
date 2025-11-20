import { JsonStreamStringify } from "json-stream-stringify";

import type { Brand, Category, Currency, IParam, Product } from "../types";
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
  params?: IParam[];
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
      if (!priceMap.has(product.productId)) {
        priceMap.set(product.productId, {
          productId: product.productId,
          skus: [],
        });
      }

      const productPrice = priceMap.get(product.productId);

      if (!productPrice) {
        console.error(`Product ${product.productId} not found in price map`);

        return;
      }

      if (!product.price) {
        // NOTE: Если у продукта нет цены, то пропускаем его
        return;
      }

      if (product.variantId === productPrice.productId) {
        // NOTE: Если это родитель, то он не является SKU
        return;
      }

      const sku: PriceSku = {
        skuId: String(product.variantId),
        price: product.price,
        currency: product.currency,
        params: product.params,
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

      productPrice.skus.push(sku);
    });

    const result: PriceProduct[] = Array.from(priceMap.values());
    const stream = new JsonStreamStringify(result);
    stream.pipe(writableStream);
  }
}
