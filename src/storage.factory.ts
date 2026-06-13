import type { Driver, Storage } from 'unstorage'
import type { StorageDriverConfig, StorageModuleOptions } from './storage.types'
import { builtinDrivers, createStorage } from 'unstorage'

function isMountConfig(config: StorageDriverConfig): config is Exclude<StorageDriverConfig, Driver> {
  return typeof (config as { driver?: unknown }).driver === 'string'
}

async function resolveDriver(config: StorageDriverConfig): Promise<Driver> {
  if (!isMountConfig(config))
    return config

  const { driver, ...options } = config
  const specifier = (builtinDrivers as Record<string, string>)[driver] ?? driver

  let module: { default?: unknown }
  try {
    module = (await import(specifier)) as { default?: unknown }
  }
  catch (cause) {
    throw new Error(`[nest-unstorage] Failed to load driver "${driver}". Install its peer dependency if it is a built-in driver.`, { cause })
  }

  const factory = module.default ?? module
  if (typeof factory !== 'function')
    throw new TypeError(`[nest-unstorage] Driver "${driver}" did not resolve to a factory function.`)

  return (factory as (options: object) => Driver)(options)
}

export async function createStorageInstance(options: StorageModuleOptions): Promise<Storage> {
  const mounts = Object.entries(options.mounts ?? {})
  const [rootDriver, mountDrivers] = await Promise.all([
    options.driver ? resolveDriver(options.driver) : Promise.resolve(undefined),
    Promise.all(mounts.map(async ([, config]) => resolveDriver(config))),
  ])

  const storage = createStorage({ driver: rootDriver })
  mounts.forEach(([base], index) => storage.mount(base, mountDrivers[index]))

  return storage
}
