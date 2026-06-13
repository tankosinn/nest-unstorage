import type { StorageModuleOptions } from './storage.types'
import { ConfigurableModuleBuilder } from '@nestjs/common'

export interface StorageModuleExtraOptions {
  /** Register the module globally. Defaults to `true`. */
  isGlobal?: boolean
}

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<StorageModuleOptions>({ moduleName: 'Storage' })
  .setClassMethodName('forRoot')
  .setExtras<StorageModuleExtraOptions>(
    { isGlobal: true },
    (definition, extras) => ({ ...definition, global: extras.isGlobal }),
  )
  .build()
