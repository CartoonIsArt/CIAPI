import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Users from "../entities/users"

/* Comments 테이블의 모든 값을 리턴함. */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()
  const comment = await conn
    .getRepository(Comments)
    .createQueryBuilder("comment")
    .leftJoinAndSelect("comment.user", "user")
    .leftJoinAndSelect("user.profileImage", "profileImage")
    .leftJoinAndSelect("comment.rootDocument", "rootDocument")
    .leftJoinAndSelect("comment.replies", "replies")
    .leftJoinAndSelect("comment.likedBy", "likedBy")
    .where("comment.id = :id", { id: ctx.params.id })
    .getOne()
  ctx.body = comment

  /* Get 완료 응답 */
  ctx.response.status = 200
}

/* text를 POST 인자로 받아 DB에 저장함. */
export const Post = async (ctx, next) => {
  /* POST 인자를 data변수로 받음 */
  const data = ctx.request.body

  /* DB 커넥션풀에서 커넥션을 하나 가져옴. */
  const conn: Connection = getConnection()

  /* comments 테이블 ORM 인스턴스 생성 */
  const comments: Comments = new Comments()

  try{
    comments.user = ctx.session.user
  }
  catch (e){
    ctx.throw(400, e)
  }

  comments.id = data.id
  comments.documentId = data.documentId
  comments.rootComment = null
  comments.createdAt = data.createdAt
  comments.text = data.text

  /* commentId를 인자로 전달하면 대댓글 relation 설정 */
  if (data.commentId !== undefined) {
    try {
      const parent = await conn
      .getRepository(Comments)
      .findOne(data.commentId)

      comments.rootComment = parent
    }
    catch (e) {
      /* 대댓글 relation설정 오류 시 400에러 리턴 */
      ctx.throw(400, e)
    }
  }

  /* 작성한 글과 relation 설정 */
  try {
    const document = await conn
    .getRepository(Documents)
    .findOne(data.documentId)

    comments.rootDocument = document
  }
  catch (e) {
    ctx.throw(400, e)
  }

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

  /* Post 완료 응답 */
  ctx.response.status = 201
}

export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 댓글 불러오기 */
    const comment = await conn
    .getRepository(Comments)
    .findOne(ctx.params.id)

    await conn
    .createQueryBuilder()
    .relation(Comments, "rootDocument")
    .of(comment)
    .set(null)

    await conn
    .createQueryBuilder()
    .relation(Comments, "rootComment")
    .of(comment)
    .set(null)

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

export const GetLikedBy = async (ctx, next) => {
  const conn: Connection = getConnection()
  const comment: Comments = await conn
    .getRepository(Comments)
    .createQueryBuilder("comment")
    .leftJoinAndSelect("comment.likedBy", "likedBy")
    .where("comment.id = :id", { id: ctx.params.id })
    .getOne()
  ctx.body = comment.likedBy

  /* Get 완료 응답 */
  ctx.response.status = 200
}

export const LikedBy = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const comment: Comments = await conn
      .getRepository(Comments)
      .findOne(ctx.params.id, { relations: ["likedBy"] })

    comment.likedBy.push(ctx.session.user)
    await conn.manager.save(comment)

    ctx.response.status = 201
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* Post 완료 응답 */
  ctx.response.status = 201
}

export const UnlikedBy = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 댓글 불러오기 */
    const comment = await conn
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
