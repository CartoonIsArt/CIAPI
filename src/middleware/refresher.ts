import { Connection, getConnection } from "typeorm"
import AuthenticationToken from "../entities/authenticationToken"
import { cookieExpirationDate } from "../lib/date"

const jwt = require('jsonwebtoken')

export default async function refresher(ctx, next) {
  if (ctx.state.jwtOriginalError === undefined)
    return await next()

  const conn: Connection = getConnection()
  let authenticationToken: AuthenticationToken = new AuthenticationToken()

  try {
    let accessToken = ctx.cookies.get('accessToken')

    // 1. Find refresh token by access token
    const authenticationTokens: AuthenticationToken[] = await conn
      .getRepository(AuthenticationToken)
      .find({ where: { accessToken } })
    authenticationToken = authenticationTokens[0]

    // 2. Decode refresh token
    const decoded = jwt.verify(authenticationToken.refreshToken, 'secretKey')
    const jsonUser = { user: decoded.user }

    // 3. Reissue access token
    accessToken = jwt.sign(jsonUser, 'secretKey', { expiresIn: '1h' })
    ctx.cookies.set('accessToken', accessToken, { expires: cookieExpirationDate(), overwrite: true })
    
    // 4. Update database
    authenticationToken.accessToken = accessToken
    await conn.manager.save(authenticationToken)
    
    // 5. Set ctx.state.token
    ctx.state.token = jsonUser
  }
  catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      await conn.manager.remove(authenticationToken)
    }
    ctx.throw(401, e)
  }

  await next()
}
