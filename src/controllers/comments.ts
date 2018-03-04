import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Users from "../entities/users"

/* 해당 댓글 GET */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()
  const comment = await conn
  .getRepository(Comments)
  .createQueryBuilder("comment")
  .leftJoinAndSelect("comment.author", "author")
  .leftJoinAndSelect("author.profileImage", "profileImage")
  .leftJoinAndSelect("comment.rootDocument", "rootDocument")
  .leftJoinAndSelect("comment.replies", "replies")
  .leftJoinAndSelect("comment.likedBy", "likedBy")
  .where("comment.id = :id", { id: ctx.params.id })
  .getOne()
  ctx.body = comment

  /* Get 완료 응답 */
  ctx.response.status = 200
}

/* 댓글 POST */
export const Post = async (ctx, next) => {
  /* POST 인자를 data변수로 받음 */
  const data = ctx.request.body

  /* DB 커넥션풀에서 커넥션을 하나 가져옴. */
  const conn: Connection = getConnection()

  /* comments 테이블 ORM 인스턴스 생성 */
  const comment: Comments = new Comments()

  /* 세션의 유저와 relation 설정 */
  try{
    comment.author = ctx.session.user
  }
  catch (e){
    /* session에 user가 없으면 400에러 리턴 */
    ctx.throw(400, e)
  }

  /* 나머지 required 정보 입력 */
  comment.id = data.id
  comment.documentId = data.documentId
  comment.rootComment = null
  comment.createdAt = data.createdAt
  comment.text = data.text

  /* commentId를 인자로 전달하면 대댓글 relation 설정 */
  if (data.commentId !== undefined) {
    try {
      const parent = await conn
      .getRepository(Comments)
      .findOne(data.commentId)

      comment.rootComment = parent
    }
    catch (e) {
      ctx.throw(400, e)
    }
  }

  /* 작성한 글과 relation 설정 */
  try {
    const document = await conn
    .getRepository(Documents)
    .findOne(data.documentId)

    comment.rootDocument = document
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* DB에 저장 - 비동기 */
  try {
    await conn.manager.save(comment)
  }
  catch (e) {
    /* 하나라도 인자에 없을 경우 400에러 리턴 */
    ctx.throw(400, e)
  }

  /* body에 응답 */
  ctx.body = comment

  /* Post 완료 응답 */
  ctx.response.status = 201
}

/* 해당 댓글 DELETE */
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
    await conn.manager.delete(Comments, comment)
    /*
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
  .createQueryBuilder("comment")
  .leftJoinAndSelect("comment.likedBy", "likedBy")
  .where("comment.id = :id", { id: ctx.params.id })
  .getOne()

  /* body에 응답 */
  ctx.body = comment.likedBy

  /* Get 완료 응답 */
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

  /* Post 완료 응답 */
  ctx.response.status = 201
}

/* 해당 댓글 좋아요 DELETE */
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
