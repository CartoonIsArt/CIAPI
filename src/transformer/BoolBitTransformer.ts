// https://stackoverflow.com/questions/55224483/loading-a-bit-mysql-field-from-typeorm
import { ValueTransformer } from 'typeorm'

class BoolBitTransformer implements ValueTransformer {
  // From db to typeorm
  from(value: Buffer): boolean | null {
    if (value === null) {
      return null
    }
    return value[0] === 1
  }

  // To db from typeorm
  to(value: boolean | null): Buffer | null {
    if (value === null) {
      return null
    }
    const res = new Buffer(1)
    res[0] = value ? 1 : 0
    return res
  }
}

export default BoolBitTransformer