import * as crypto from "crypto"
import { Connection, getConnection } from "typeorm"
import Users from "../entities/users"

export default async function Auth (username: string, password: string): Promise<Users> {
  const conn: Connection = getConnection()
  const users: Users[] = await conn
    .getRepository(Users)
    .find({
      where: {
        password,
        username,
      },
    })
  return users[0]
}
