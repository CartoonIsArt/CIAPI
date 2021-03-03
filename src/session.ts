import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import Sessions from "./entities/sessions"

const session = async (ctx, next) => {
  const conn: Connection = getConnection()

  if (ctx.request.url !== "/login") {
    try {
      const session: Sessions[] = await conn
      .getRepository(Sessions)
      .find({
        where: {
          data: ctx.cookies.get("CIASESSIONID")
        },
        relations: [
          "user",
          "user.profileImage"
        ]
      })
      ctx.session = session[0]
    }
    catch (e) {
      ctx.throw(401, e)
    }
  }

  await next()
}

export default session
