import { UserRole } from "../entities/account"

export default function gatekeeper(ctx, next) {
  if (ctx.request.url.match(/^\/api\/public(?:\/)?/))
    return next()

  const { user } = ctx.state.token

  if (!user.isApproved)
    ctx.throw(403, '승인이 완료될 때까지 기다려주세요.', { user })

  /*  user.role이 UserRole.LEAVER인 경우는 물론이고
      null인 경우, undefined인 경우, 심지어 이상한 값을 달고 오는 경우에도 403을 주어야 하기 때문에
      아래와 같은 whitelist 형식으로 작성해야 합니다
  */
  if (user.role === UserRole.REGULAR)       return next()  // 성능 상의 이유로 REGULAR를 제일 먼저 두어야 함
  if (user.role === UserRole.NON_REGULAR)   return next()
  if (user.role === UserRole.SUPERUSER)     return next()
  if (user.role === UserRole.BOARD_MANAGER) return next()
  if (user.role === UserRole.MANAGER)       return next()

  ctx.throw(403, '접근 권한이 없습니다.', { user })
}