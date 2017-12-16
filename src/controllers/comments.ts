import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import Comments from "../entities/comments"
import Users from "../entities/users"

/* Comments 테이블의 모든 값을 리턴함. */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()
  const comment = await conn
    .getRepository(Comments)
    .createQueryBuilder("comment")
    .leftJoinAndSelect("comment.author", "author")
    .leftJoinAndSelect("author.profileImage", "profileImage")
    .getMany()
  ctx.body = comment
}

/* text를 POST 인자로 받아 DB에 저장함. */
export const Post = async (ctx, next) => {
    /* POST 인자를 data변수로 받음 */
  const data = ctx.request.body

    /* DB 커넥션풀에서 커넥션을 하나 가져옴. */
  const conn: Connection = getConnection()
  const userRepository = conn.getRepository(Users)
  const user: Users = await userRepository.findOneById(1)

    /* comments 테이블 ORM 인스턴스 생성 */
  const comments: Comments = new Comments()
  comments.id = data.id
  comments.documentId = data.documentId
  comments.commentId = data.commentId ? data.commentId : 0
  comments.createdAt = data.createdAt
  comments.text = data.text
  comments.author = user

    /* DB에 저장 - 비동기 */
  try {
    await conn.manager.save(comments)
  }
  catch (e) {
    /* 하나라도 인자에 없을 경우 400에러 리턴 */
    ctx.throw(400, e)
  }
    /* id와 created_at을 포함하여 body에 응답 */
  ctx.body = comments
}

export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const comment = await conn
                          .getRepository(Comments)
                          .findOneById(ctx.params.id)
    await conn.manager.remove(comment)
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
