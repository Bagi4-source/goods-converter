import { expect, describe, it } from 'vitest'
import { categories, products } from './constants'
import { Formatters } from '../src'

describe('Excel formatter', () => {
  const formatter = new Formatters.ExcelFormatter()

  it('should export Excel data', async () => {
    const result = await formatter.format(products, categories)
    expect(result).toMatchSnapshot()
  })
})
