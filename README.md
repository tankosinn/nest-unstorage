# nest-unstorage

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Type-safe [unstorage](https://unstorage.unjs.io/) integration for [NestJS](https://nestjs.com/) with an injectable, driver-based key-value storage.

## Install

```sh
pnpm add nest-unstorage unstorage
```

## Usage

```ts
import { Module } from '@nestjs/common'
import { StorageModule } from 'nest-unstorage'

@Module({
  imports: [
    StorageModule.forRoot({
      driver: { driver: 'redis', url: process.env.REDIS_URL },
    }),
  ],
})
export class AppModule {}
```

```ts
import type { Storage } from 'unstorage'
import { Injectable } from '@nestjs/common'
import { InjectStorage } from 'nest-unstorage'

@Injectable()
export class TokenService {
  constructor(@InjectStorage() private readonly storage: Storage) {}
}
```

Built-in drivers load on demand; install their peer deps (`ioredis` for `redis`).

### Async

```ts
StorageModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    driver: { driver: 'redis', url: config.getOrThrow('REDIS_URL') },
  }),
})
```

## License

[MIT](./LICENSE) License © [Tankosin](https://github.com/tankosinn)

<!-- Badges -->

[npm-version-src]: https://npmx.dev/api/registry/badge/version/nest-unstorage
[npm-version-href]: https://npmx.dev/package/nest-unstorage
[npm-downloads-src]: https://npmx.dev/api/registry/badge/downloads/nest-unstorage
[npm-downloads-href]: https://npmx.dev/package/nest-unstorage
[license-src]: https://img.shields.io/npm/l/nest-unstorage?style=flat&colorA=080f12&colorB=1fa669
[license-href]: ./LICENSE
