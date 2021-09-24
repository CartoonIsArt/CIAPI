import { Connection, Equal, getConnection, MoreThan } from "typeorm"
import Document from "../entities/document"

export const GetAllFrom = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { from } = ctx.query

  try {
    const documents: Document[] = await conn
      .getRepository(Document)
      .find({
        relations: [
          "author",
          "author.profile",
          "author.student",
          "likedAccounts",
          "likedAccounts.student",
          "comments",
          "comments.author",
          "comments.author.profile",
          "comments.author.student",
          "comments.likedAccounts",
          "comments.likedAccounts.student",
        ],
        where: {
          createdAt: MoreThan(from),
          isNotification: Equal(true),
        },
        order: {
          id: 'DESC',
        }
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      notifications: documents,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}