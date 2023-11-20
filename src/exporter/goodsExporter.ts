import { type FormatterAbstract, type FormatterOptions, Formatters } from '../formatter'
import { type Exporter, type Transformer } from './exporter.types'
import { type Category } from '../types'
import * as fs from 'fs'
import { transformerToStreamTransformer } from '../utils/transformerToStreamTransformer'
import { type Readable } from 'stream'

export class GoodsExporter {
  private formatter: FormatterAbstract = new Formatters.YMLFormatter()
  private exporter: Exporter = (data: Buffer) => {
    const filename = `${this.formatter.formatterName}.output.${this.formatter.fileExtension}`
    fs.writeFileSync(filename, data)
    return data
  }

  private transformers = new Array<Transformer>()

  public setTransformers (transformers: Transformer[]): void {
    this.transformers = transformers
  }

  public setFormatter (formatter: FormatterAbstract): void {
    this.formatter = formatter
  }

  public setExporter (exporter: Exporter): void {
    this.exporter = exporter
  }

  async export<T>(products: Readable, categories?: Category[], option?: FormatterOptions): Promise<T> {
    const transformersForStream = this.transformers.map(transformerToStreamTransformer)

    let output = products

    transformersForStream.forEach(transformer => {
      output = output.pipe(transformer)
    })

    products.pipe(transformersForStream[0])

    const data = await this.formatter.format(output, categories, option)

    if (typeof data === 'string') {
      return this.exporter(Buffer.from(data, 'utf-8'))
    }
    return this.exporter(data)
  }
}
