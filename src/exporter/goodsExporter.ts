import deepcopy from "deepcopy";

import {
  type FormatterAbstract,
  type FormatterOptions,
  Formatters,
} from "../formatter";
import { type Category, type Product } from "../types";
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
    option?: FormatterOptions,
  ): Promise<Buffer> {
    const transformedProducts = deepcopy(products).map((product) => {
      let transformedProduct: Product = product;
      this.transformers.forEach((transformer) => {
        transformedProduct = transformer(transformedProduct);
      });
      return transformedProduct;
    });
    const data = await this.formatter.format(
      transformedProducts,
      categories,
      option,
    );

    if (typeof data === "string") {
      return await this.exporter(Buffer.from(data, "utf-8"));
    }
    return await this.exporter(data);
  }
}
