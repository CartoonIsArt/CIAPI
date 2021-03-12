import { Connection, getConnection } from "typeorm"
import * as crypto from "crypto"
import User from "../entities/user"

export async function Authenticate (username: string, password: string): Promise<User> {
  const conn: Connection = getConnection()
  const users: User[] = await conn
    .getRepository(User)
    .find({
      where: {
        username,
      },
      relations: ['profileImage']
    })
  const user = users[0]

  const [encryptedKey, salt] = user.password.split("@")
  const derivedKey = crypto.pbkdf2Sync(password, salt, 131071, 64, 'sha512')

  if (derivedKey.toString('hex') !== encryptedKey)
    throw new Error('password mismatch')
  return user
}
