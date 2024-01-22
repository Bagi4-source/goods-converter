import deepcopy from "deepcopy";

import {
  type FormatterAbstract,
  type FormatterOptions,
  Formatters,
} from "../formatter";
import { type Brand, type Category, type Product } from "../types";
import { type Exporter, type Transformer } from "./exporter.types";

import * as fs from "fs";

export class GoodsExporter {
  private formatter: FormatterAbstract = new Formatters.YMLFormatter();
  private exporter: Exporter = (data: Buffer) => {
    const filename = `${this.formatter.formatterName}.output.${this.formatter.fileExtension}`;
    fs.writeFileSync(filename, data);
    return data;
  };

  private transformers = new Array<Transformer>();

  public setTransformers(transformers: Transformer[]): void {
    this.transformers = transformers;
  }

  public setFormatter(formatter: FormatterAbstract): void {
    this.formatter = formatter;
  }

  public setExporter(exporter: Exporter): void {
    this.exporter = exporter;
  }

  async export(
    products: Product[],
    categories?: Category[],
    brands?: Brand[],
    option?: FormatterOptions,
  ): Promise<Buffer> {
    const copyProducts = deepcopy(products);
    const transformedProducts = await Promise.all(
      copyProducts.map(async (product) => {
        let transformedProduct: Product = product;
        for (const transformer of this.transformers)
          transformedProduct = await transformer(transformedProduct);
        return transformedProduct;
      }),
    );
    const data = await this.formatter.format(
      transformedProducts,
      categories,
      brands,
      option,
    );

    if (typeof data === "string") {
      return await this.exporter(Buffer.from(data, "utf-8"));
    }
    return await this.exporter(data);
  }
}
