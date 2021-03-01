import * as crypto from "crypto"
import { Connection, getConnection } from "typeorm"
import Users from "../entities/users"

export default async function Auth (username: string, password: string): Promise<Users> {
  const conn: Connection = getConnection()
  const users: Users[] = await conn
    .getRepository(Users)
    .find({
      where: {
        username,
      },
    })
  const user = users[0]

  const [encryptedKey, salt] = user.password.split("@")
  const derivedKey = crypto.pbkdf2Sync(password, salt, 131071, 64, 'sha512')

  if (derivedKey.toString('hex') !== encryptedKey)
    throw new Error('password mismatch')
  return user
}
