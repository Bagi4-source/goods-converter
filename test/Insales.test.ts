import { expect, describe, it } from 'vitest'
import { categories, products } from './constants'
import { Formatters } from '../src'

describe('Insales formatter', () => {
  const formatter = new Formatters.InsalesFormatter()

  it('should export Insales data', async () => {
    const result = await formatter.format(products, categories)
    expect(result).toMatchSnapshot()
  })
})
