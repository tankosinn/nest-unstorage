import { Inject } from '@nestjs/common'
import { STORAGE } from './storage.constants'

/** Property/parameter decorator that injects the {@link STORAGE} instance. */
export function InjectStorage(): PropertyDecorator & ParameterDecorator {
  return Inject(STORAGE)
}
