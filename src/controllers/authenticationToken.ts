import { Connection, getConnection } from "typeorm"
import { Authenticate } from "../auth"
import { cookieExpirationDate } from "../lib/date"
import AuthenticationToken from "../entities/authenticationToken"

const jwt = require('jsonwebtoken')

class NotApprovedError extends Error {
  constructor(message: string) {
    super(message)
  }
}

/* 로그인 */
export const Login = async (ctx, next) => {
  const authenticationToken: AuthenticationToken = new AuthenticationToken()
  const conn: Connection = getConnection()

  try {
    // 1. User authentication
    const {
      username,
      password,
    } = ctx.request.body

    const user = await Authenticate(username, password)

    if (!user.isApproved)
      throw new NotApprovedError('승인이 완료될 때까지 기다려 주세요.')

    // 2. Issue access token and refresh token
    const accessToken = jwt.sign({ user }, 'secretKey', { expiresIn: '1h' })
    const refreshToken = jwt.sign({ user }, 'secretKey', { expiresIn: '14d' })                      

    // 3. Set authentication token cookie
    ctx.cookies.set('accessToken', accessToken, { expires: cookieExpirationDate() })

    // 4. Save refresh token to database 
    authenticationToken.accessToken = accessToken
    authenticationToken.refreshToken = refreshToken
    authenticationToken.accessIp = ctx.ip

    await conn.manager.save(authenticationToken)

    /* 로그인 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    if (e instanceof NotApprovedError)
      ctx.throw(403, e)
    else
      ctx.throw(400, e)
  }
}

/* 로그아웃 */
export const Logout =  async (ctx, next) => {
  const conn: Connection = getConnection()
  const accessToken = ctx.cookies.get('accessToken')

  try {
    // 1. Remove authentication token from DB
    const authenticationTokens: AuthenticationToken[] = await conn
      .getRepository(AuthenticationToken)
      .find({ where: { accessToken } })
    const authenticationToken = authenticationTokens[0]
    await conn.manager.remove(authenticationToken)

    // 2. Delete access token from user's browser
    ctx.cookies.set('accessToken')

    /* 로그아웃 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
