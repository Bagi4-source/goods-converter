import { YMLFormatter } from '../src'
import { expect, describe, it, vi } from 'vitest'
import { categories, products } from './constants'

describe('YMLConverter', () => {
  const formatter = new YMLFormatter()
  vi.useFakeTimers().setSystemTime(new Date('2020-01-01'))

  it('should export YML data', async () => {
    const result = await formatter.format(products, categories, { shopName: 'Bagi4', companyName: 'Bagi4' })

    expect(result).toMatchSnapshot()
  })
})
