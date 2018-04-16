import { Connection, getConnection } from "typeorm"
import Documents from "../entities/documents"
import Users from "../entities/users"

/* 타임라인 GET */
export const GetTimeline = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const timeline: Documents[] = await conn
    .getRepository(Documents)
    .find({
      order: {
        id: -1,
      },
      relations: [
        "author",
        "author.profileImage",
        "comments",
        "comments.author",
        "comments.author.profileImage",
        "comments.replies",
        "comments.likedBy",
        "likedBy",
      ],
      skip: (ctx.params.page - 1) * 5,
      take: 5,
    })

    ctx.body = timeline
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}
