import { expect, describe, it } from 'vitest'
import { categories, products } from './constants'
import { TgShopFormatter } from '../src'

describe('TgShop formatter', () => {
  const formatter = new TgShopFormatter()

  it('should export TgShop data', async () => {
    const result = await formatter.format(products, categories)
    expect(result).toMatchSnapshot()
  })
})
