import type { TestingModule } from '@nestjs/testing'
import type { Driver, Storage } from 'unstorage'
import type { StorageModuleOptions } from '../../src'
import { Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import memoryDriver from 'unstorage/drivers/memory'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InjectStorage, STORAGE, StorageModule } from '../../src'

@Injectable()
class StorageConsumer {
  constructor(@InjectStorage() readonly storage: Storage) {}
}

@Module({ providers: [StorageConsumer] })
class ConsumerModule {}

describe('storageModule', () => {
  let moduleRef: TestingModule | undefined

  afterEach(async () => {
    await moduleRef?.close()
    moduleRef = undefined
  })

  it('provides a single global storage injectable across modules', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        StorageModule.forRoot({ driver: { driver: 'memory' } }),
        ConsumerModule,
      ],
    }).compile()

    const storage = moduleRef.get<Storage>(STORAGE)
    expect(moduleRef.get(StorageConsumer).storage).toBe(storage)
  })

  it('does not leak the token to non-importing modules when non-global', async () => {
    await expect(
      Test.createTestingModule({
        imports: [
          StorageModule.forRoot({ isGlobal: false, driver: { driver: 'memory' } }),
          ConsumerModule,
        ],
      }).compile(),
    ).rejects.toThrow()
  })

  it('exports the token to importing modules when non-global', async () => {
    @Module({
      imports: [StorageModule.forRoot({ isGlobal: false, driver: { driver: 'memory' } })],
      providers: [StorageConsumer],
    })
    class ImporterModule {}

    moduleRef = await Test.createTestingModule({ imports: [ImporterModule] }).compile()
    expect(moduleRef.get(StorageConsumer, { strict: false }).storage).toBeDefined()
  })

  it('wires forRootAsync through imported, injected dependencies', async () => {
    const dispose = vi.fn()

    @Injectable()
    class DriverFactory {
      create(): Driver {
        return { ...memoryDriver(), dispose }
      }
    }

    @Module({ providers: [DriverFactory], exports: [DriverFactory] })
    class DriverModule {}

    moduleRef = await Test.createTestingModule({
      imports: [
        StorageModule.forRootAsync({
          imports: [DriverModule],
          inject: [DriverFactory],
          useFactory: (factory: DriverFactory): StorageModuleOptions => ({ driver: factory.create() }),
        }),
      ],
    }).compile()

    expect(moduleRef.get<Storage>(STORAGE)).toBeDefined()

    await moduleRef.close()
    moduleRef = undefined
    expect(dispose).toHaveBeenCalledOnce()
  })

  it('supports forRootAsync with a useClass options factory', async () => {
    class StorageOptionsFactory {
      create(): StorageModuleOptions {
        return { driver: memoryDriver() }
      }
    }

    moduleRef = await Test.createTestingModule({
      imports: [StorageModule.forRootAsync({ useClass: StorageOptionsFactory })],
    }).compile()

    expect(moduleRef.get<Storage>(STORAGE)).toBeDefined()
  })

  it('disposes the storage on application shutdown', async () => {
    const dispose = vi.fn()
    const driver: Driver = { ...memoryDriver(), dispose }

    moduleRef = await Test.createTestingModule({
      imports: [StorageModule.forRoot({ driver })],
    }).compile()
    moduleRef.get<Storage>(STORAGE)

    await moduleRef.close()
    moduleRef = undefined
    expect(dispose).toHaveBeenCalledOnce()
  })
})
