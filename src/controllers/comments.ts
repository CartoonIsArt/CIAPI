import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Users from "../entities/users"

/* 해당 댓글 GET */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()
  const comment = await conn
  .getRepository(Comments)
  .findOne(ctx.params.id, {
    relations: [
      "author",
      "author.profileImage",
      "rootDocument",
      "likedBy",
      "replies",
      "rootComment",
    ]})

  ctx.body = comment
  ctx.response.status = 200
}

/* 댓글 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const comment: Comments = new Comments()
  const data = ctx.request.body

  try{
    /* 세션의 유저와 relation 설정 */
    comment.author = ctx.session.user

    /* commentId를 인자로 전달하면 대댓글 relation 설정 */
    if (typeof(data.commentId) === "number") {
      const parent: Comments = await conn
      .getRepository(Comments)
      .findOne(data.commentId)

      comment.rootComment = parent
    }

    /* 게시글과 relation 설정 */
    const document: Documents = await conn
    .getRepository(Documents)
    .findOneOrFail(Number(data.documentId))

    comment.rootDocument = document

    /* 나머지 required 정보 입력 */
    comment.id = data.id
    comment.createdAt = data.createdAt
    comment.text = data.text

    await conn.manager.save(comment)
    ctx.body = comment
  }
  catch (e){
    ctx.throw(400, e)
  }
  ctx.response.status = 200
}

/* 해당 댓글 DELETE */
export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comments = await conn
    .getRepository(Comments)
    .findOne(ctx.params.id)

    /* 대댓글 모두 삭제 */
    await conn
    .createQueryBuilder()
    .delete()
    .from(Comments)
    .where("rootCommentId = :root", { root: comment.id })
    .execute()

    /* DB에서 댓글 삭제 */
    await conn
    .createQueryBuilder()
    .delete()
    .from(Comments)
    .where("id = :id", { id: comment.id })
    .execute()

    /* 삭제 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 댓글 좋아요 GET */
export const GetLikedBy = async (ctx, next) => {
  const conn: Connection = getConnection()
  const comment: Comments = await conn
  .getRepository(Comments)
  .findOne(ctx.params.id, { relations: ["likedBy"] })

  ctx.body = comment.likedBy
  ctx.response.status = 200
}

/* 해당 댓글 좋아요 POST */
export const LikedBy = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const comment: Comments = await conn
    .getRepository(Comments)
    .findOne(ctx.params.id, { relations: ["likedBy"] })

    comment.likedBy.push(ctx.session.user)
    await conn.manager.save(comment)
  }
  catch (e) {
    ctx.throw(400, e)
  }
  ctx.response.status = 200
}

/* 해당 댓글 좋아요 DELETE */
export const UnlikedBy = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comments = await conn
    .getRepository(Comments)
    .findOne(ctx.params.id)

    /* 댓글과 유저의 좋아요 relation 해제 */
    await conn
    .createQueryBuilder()
    .relation(Comments, "likedBy")
    .of(comment)
    .remove(ctx.session.user)

    /* 해제 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
