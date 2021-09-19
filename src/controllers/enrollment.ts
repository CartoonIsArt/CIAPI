import { Connection, getConnection, MoreThan } from "typeorm"
import Account from "../entities/account"
import Enrollment from "../entities/enrollment"

export const GetOne = async (ctx, next) => {
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
        where: {
          endDate: MoreThan(new Date()),
        },
        order: {
          id: 'DESC',
        },
        take: 1,
      })
    const enrollment = enrollments[0];

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      enrollment,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

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

export const Patch = async (ctx) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const { user } = ctx.state.token
  
  try {
    const account: Account = await conn
      .getRepository(Account)
      .findOne(user.id)

    const enrollment: Enrollment = await conn
      .getRepository(Enrollment)
      .findOne(id, {
        relations: [
          "enrollees",
          "candidates",
        ],
      })

    enrollment.enrollees.push(account)
    enrollment.candidates.filter(candidate => candidate.id !== account.id)

    await conn.manager.save(enrollment)

    /* PATCH 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}