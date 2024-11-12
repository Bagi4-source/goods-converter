import {
  type FormatterAbstract,
  type FormatterOptions,
  Formatters,
} from "../formatter";
import { type Brand, type Category, type Product } from "../types";
import { type Exporter, type Transformer } from "./exporter.types";

import fs from "fs";

export class GoodsExporter<Context extends object | undefined> {
  private _context: Context;

  constructor(readonly context: Context) {
    this._context = context;
  }

  public setContext(context: Context): void {
    this._context = context;
  }

  private formatter: FormatterAbstract = new Formatters.YMLFormatter();
  private exporter: Exporter = () => {
    return fs.createWriteStream(
      `${this.formatter.formatterName}.output.${this.formatter.fileExtension}`,
    );
  };

  private transformers = new Array<Transformer<Context>>();

  public setTransformers(transformers: Array<Transformer<Context>>): void {
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
      transformedProducts = await transformer(
        transformedProducts,
        this._context,
      );

    const writableStream = this.exporter();

    await this.formatter.format(
      writableStream,
      transformedProducts,
      categories,
      brands,
      option,
    );
  }
}
