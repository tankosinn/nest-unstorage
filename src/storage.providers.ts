import type { OnApplicationShutdown, Provider } from '@nestjs/common'
import type { Storage } from 'unstorage'
import { Inject, Injectable } from '@nestjs/common'
import { STORAGE } from './storage.constants'
import { createStorageInstance } from './storage.factory'
import { MODULE_OPTIONS_TOKEN } from './storage.module-definition'

export const storageProvider: Provider = {
  provide: STORAGE,
  useFactory: createStorageInstance,
  inject: [MODULE_OPTIONS_TOKEN],
}

@Injectable()
export class StorageDisposer implements OnApplicationShutdown {
  constructor(@Inject(STORAGE) private readonly storage: Storage) {}

  async onApplicationShutdown(): Promise<void> {
    await this.storage.dispose()
  }
}
