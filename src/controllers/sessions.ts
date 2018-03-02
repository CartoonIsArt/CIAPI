import * as crypto from "crypto"
import { Connection, getConnection, getManager } from "typeorm"
import Auth from "../auth/auth"
import Sessions from "../entities/sessions"
import Users from "../entities/users"
import { ipToInt } from "../lib/ip2int"

/* 로그인 */
export const Login = async (ctx, next) => {
  const session: Sessions = new Sessions()
  const conn: Connection = getConnection()
  const hash: crypto.Hash = crypto.createHash("sha256")

  try{
    const {
      username,
      password,
      to = "/",
    } = ctx.request.body

    session.user = await Auth(username, password)
    session.data = hash.update(Math.random().toString()).digest("hex")
    session.ipv4 = ipToInt(String(ctx.ip))

    ctx.session = await conn.manager.save(session)
    ctx.set("CIASESSIONID", session.data)
    ctx.response.body = session.user
  }
  catch (e){
    ctx.throw(400, e)
    // ctx.throw(400, "Login failed")
  }

  /* 로그인 완료 응답 */
  ctx.response.status = 201
}

/* 로그아웃 */
export const Logout =  async (ctx, next) => {
  try {
    const conn: Connection = getConnection()
    await conn.manager.delete(Sessions, ctx.session.id)

    ctx.status = 204
    ctx.redirect("/")
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* 로그아웃 완료 응답 */
  ctx.response.status = 204
}
