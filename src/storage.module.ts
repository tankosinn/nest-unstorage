import type { DynamicModule } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { STORAGE } from './storage.constants'
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  OPTIONS_TYPE,
} from './storage.module-definition'
import { StorageDisposer, storageProvider } from './storage.providers'

@Module({})
export class StorageModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.withStorage(super.forRoot(options))
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.withStorage(super.forRootAsync(options))
  }

  private static withStorage(definition: DynamicModule): DynamicModule {
    return {
      ...definition,
      providers: [...(definition.providers ?? []), storageProvider, StorageDisposer],
      exports: [...(definition.exports ?? []), STORAGE],
    }
  }
}
