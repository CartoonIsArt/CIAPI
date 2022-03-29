// https://stackoverflow.com/questions/55224483/loading-a-bit-mysql-field-from-typeorm
import { ValueTransformer } from 'typeorm'

export class BitTransformer implements ValueTransformer {
  // From db to typeorm
  from(value: Buffer): number | null {
    if (value === null) {
      return null
    }
    return value[0]
  }

  // To db from typeorm
  to(value: number | null): Buffer | null {
    if (value === null) {
      return null
    }
    return Buffer.alloc(1, value)
  }
}
