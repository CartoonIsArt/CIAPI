import { Connection, getConnection, LessThan, MoreThan } from "typeorm"
import Account from "../entities/account"
import Enrollment from "../entities/enrollment"

export const GetAll = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const enrollments: Enrollment[] = await conn
      .getRepository(Enrollment)
      .find({
        relations: [
          "enrollees",
          "enrollees.profile",
          "enrollees.student",
          "candidates",
          "candidates.profile",
          "candidates.student",
        ],
        order: {
          id: 'DESC',
        }
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      enrollments,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const Post = async (ctx) => {
  const conn: Connection = getConnection()
  const { title, startDate, endDate } = ctx.request.body
  
  try {
    const candidates: Account[] = await conn
      .getRepository(Account)
      .find({
        relations: [
          "profile",
          "student",
        ],
      })

    const enrollment: Enrollment = new Enrollment()
    enrollment.title = title
    enrollment.startDate = startDate
    enrollment.endDate = endDate
    enrollment.enrollees = []
    enrollment.candidates = candidates

    await conn.manager.save(enrollment)

    /* GET 완료 응답 */
    ctx.response.status = 201
    ctx.body = {
      enrollment,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}