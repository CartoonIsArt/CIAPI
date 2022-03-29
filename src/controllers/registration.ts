import { Connection, getConnection } from "typeorm"
import Account from "../entities/account"

/* 모든 계정 GET */
export const GetAll = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const accounts: Account[] = await conn
      .getRepository(Account)
      .find({
        relations: ["profile", "student"],
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      registrations: accounts.filter(account => account.isApproved),
      unregistrations: accounts.filter(account => !account.isApproved),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
