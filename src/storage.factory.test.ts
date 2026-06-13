import memoryDriver from 'unstorage/drivers/memory'
import { describe, expect, it } from 'vitest'
import { createStorageInstance } from './storage.factory'

const notADriver = new URL('../test/fixtures/not-a-driver.mjs', import.meta.url).href

describe('createStorageInstance', () => {
  it('defaults to an in-memory root driver', async () => {
    const storage = await createStorageInstance({})
    await storage.setItem('key', 'value')
    expect(await storage.getItem('key')).toBe('value')
  })

  it('resolves a built-in driver referenced by name', async () => {
    const storage = await createStorageInstance({ driver: { driver: 'memory' } })
    await storage.setItem('n', 1)
    expect(await storage.getItem('n')).toBe(1)
  })

  it('accepts a driver instance', async () => {
    const storage = await createStorageInstance({ driver: memoryDriver() })
    await storage.setItem('n', 1)
    expect(await storage.getItem('n')).toBe(1)
  })

  it('routes a mounted base to its own driver', async () => {
    const storage = await createStorageInstance({ mounts: { cache: { driver: 'memory' } } })
    await storage.setItem('cache:hit', 'a')
    expect(await storage.getItem('cache:hit')).toBe('a')
  })

  it('rejects when a driver name cannot be loaded', async () => {
    await expect(createStorageInstance({ driver: { driver: 'nope' } as never }))
      .rejects
      .toThrow('[nest-unstorage] Failed to load driver "nope"')
  })

  it('propagates load failures from mounts', async () => {
    await expect(createStorageInstance({ mounts: { cache: { driver: 'nope' } as never } }))
      .rejects
      .toThrow('[nest-unstorage] Failed to load driver "nope"')
  })

  it('throws when a specifier does not resolve to a factory', async () => {
    await expect(createStorageInstance({ driver: { driver: notADriver } as never }))
      .rejects
      .toThrow('did not resolve to a factory function')
  })
})
