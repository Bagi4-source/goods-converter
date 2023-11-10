import { GoodsExporter, type Transformer, YMLFormatter } from '../src'
import { describe, expect, it, vi } from 'vitest'
import { categories, products } from './constants'

describe('GoodsExporter', () => {
  vi.useFakeTimers().setSystemTime(new Date('2020-01-01'))

  const exporter = new GoodsExporter()
  const formatter = new YMLFormatter()

  it('check export', async () => {
    const data = await exporter.export<Buffer>(products, categories)
    expect(data.toString('utf-8')).toMatchSnapshot()
  })

  it('check export with transformers', async () => {
    const transformers: Record<string, Transformer> = {
      PRICE: (product) => ({
        ...product,
        price: product.price + 10000
      }),
      IMAGE: (product) => ({
        ...product,
        images: product.images?.map(image => image.replace('image', 'pic'))
      })
    }

    const keys = ['PRICE', 'IMAGE']

    exporter.setFormatter(formatter)
    exporter.setTransformers(keys.map(key => transformers[key]))

    exporter.setExporter((data: Buffer) => {
      return data
    })

    const data = await exporter.export<Buffer>(products, categories)

    expect(data.toString('utf-8')).toMatchSnapshot()
  })
})
