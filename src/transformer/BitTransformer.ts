// https://stackoverflow.com/questions/55224483/loading-a-bit-mysql-field-from-typeorm
import { ValueTransformer } from 'typeorm'

class BitTransformer<T extends number | boolean> implements ValueTransformer {
  // From db to typeorm
  from(value: Buffer): T | null {
    if (value === null) {
      return null
    }
    return value[0] as T
  }

  // To db from typeorm
  to(value: T | null): Buffer | null {
    if (value === null) {
      return null
    }
    return Buffer.alloc(1, value as number)
  }
}

export default BitTransformer