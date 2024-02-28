import {
  type FormatterAbstract,
  type FormatterOptions,
  Formatters,
} from "../formatter";
import { type Brand, type Category, type Product } from "../types";
import { type Exporter, type Transformer } from "./exporter.types";

import fs from "fs";

export class GoodsExporter {
  private formatter: FormatterAbstract = new Formatters.YMLFormatter();
  private exporter: Exporter = () => {
    return fs.createWriteStream(
      `${this.formatter.formatterName}.output.${this.formatter.fileExtension}`,
    );
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
  ): Promise<void> {
    let transformedProducts: Product[] = products;

    for (const transformer of this.transformers)
      transformedProducts = await transformer(transformedProducts);

    const stream = await this.formatter.format(
      transformedProducts,
      categories,
      brands,
      option,
    );
    stream.pipe(this.exporter());
  }
}
