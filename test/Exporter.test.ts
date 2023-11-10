import { GoodsExporter, YMLFormatter } from '../src'
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
    exporter.setFormatter(formatter)
    exporter.setTransformers([
      (product) => ({
        ...product,
        price: product.price + 10000,
        images: product.images?.map(image => image.replace('image', 'pic'))
      })
    ])

    exporter.setExporter((data: Buffer) => {
      return data
    })

    const data = await exporter.export<Buffer>(products, categories)

    expect(data.toString('utf-8')).toMatchSnapshot()
  })
})
