import { expect, describe, it } from 'vitest'
import { categories, products } from './constants'
import { Formatters } from '../src'

describe('TgShop formatter', () => {
  const formatter = new Formatters.TgShopFormatter()

  it('should export TgShop data', async () => {
    const result = await formatter.format(products, categories)
    expect(result).toMatchSnapshot()
  })
})
