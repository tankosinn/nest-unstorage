import type { BuiltinDriverName, BuiltinDriverOptions, Driver } from 'unstorage'

type OptionsFor<Name extends BuiltinDriverName> = Name extends keyof BuiltinDriverOptions
  ? BuiltinDriverOptions[Name]
  : unknown

/**
 * A built-in driver referenced by name with its options inlined and type-checked
 * (e.g. `{ driver: 'fs', base: './data' }`).
 */
export type BuiltinMountConfig = {
  [Name in BuiltinDriverName]: { driver: Name } & OptionsFor<Name>
}[BuiltinDriverName]

/**
 * A mount's driver: a built-in referenced by name ({@link BuiltinMountConfig}) or a
 * `Driver` instance (e.g. `memoryDriver()`).
 */
export type StorageDriverConfig = Driver | BuiltinMountConfig

/** Options for {@link StorageModule.forRoot}. */
export interface StorageModuleOptions {
  /** Root driver for unprefixed keys. Defaults to an in-memory driver. */
  driver?: StorageDriverConfig
  /** Mountpoints keyed by base, each routed to its own driver. */
  mounts?: Record<string, StorageDriverConfig>
}
