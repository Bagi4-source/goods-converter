import { TildaFormatter } from '../src'
import { expect, describe, it } from 'vitest'
import { categories, products } from './constants'

describe('TildaConverter', () => {
  const formatter = new TildaFormatter()

  it('should export Tilda csv data', async () => {
    const result = await formatter.format(products, categories)
    expect(result).toMatchSnapshot()
  })
})
