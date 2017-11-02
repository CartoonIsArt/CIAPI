import { Connection, getConnection, getManager } from "typeorm"
import Users from "../entities/users"

export const Get = async (ctx, next) => {
  const entityManager = getManager()
  ctx.body = await entityManager.find(Users)
}

export const Post = async (ctx, next) => {
  const data = ctx.request.body
  if (data.firstname !== undefined) {
    const conn: Connection = getConnection()
    const user: Users = new Users()
    user.firstname = data.firstname

    await conn.manager.save(user)
    ctx.body = user
  }
  else {
    ctx.throw(400, "firstname required")
  }
}
