import * as crypto from "crypto"
import { Connection, getConnection } from "typeorm"
import Account from "../entities/account"

export async function Authenticate (username: string, password: string): Promise<Account> {
  const conn: Connection = getConnection()
  const account: Account = await conn
    .getRepository(Account)
    .findOne({
      where: {
        username
      },
      relations: ["permission", "profile", "student"],
    })
  const derivedKey = crypto.pbkdf2Sync(password, account.salt, 131071, 64, 'sha512')

  if (derivedKey.toString('hex') !== account.password)
    throw new Error('password mismatch')
  return account
}
