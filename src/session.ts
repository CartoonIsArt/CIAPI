import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import Sessions from "./entities/sessions"

const session = async (ctx, next) => {
  const conn: Connection = getConnection()
  try {
    const s = await conn
    .getRepository(Sessions)
    .createQueryBuilder("session")
    .innerJoin("session.user", "user")
    .where("session.data = :data", { data : ctx.header.CIASESSIONID })
    .getOne()

    ctx.session = s
    console.log(s)
  }
  catch (e) {
    ctx.throw(401, e)
  }

  await next()
}

export default session
