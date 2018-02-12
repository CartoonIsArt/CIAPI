import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import Sessions from "./entities/sessions"

const session = async (ctx, next) => {
  const conn: Connection = getConnection()

  if (ctx.request.url !== "/login") {
    try {
      const s = await conn
      .getRepository(Sessions)
      .createQueryBuilder("session")
      .innerJoin("session.user", "user")
      .where("session.data = :data", { data : ctx.header.CIASESSIONID })
      .getOne()

      ctx.session = s
    }
    catch (e) {
      ctx.throw(401, e)
    }
  }

  await next()
}

export default session
