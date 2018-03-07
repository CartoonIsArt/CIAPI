import { Connection, getConnection } from "typeorm"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Users from "../entities/users"

/* 해당 댓글 GET */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const comment: Comments = await conn
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
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* GET 성공 응답 */
  ctx.response.status = 200
}

/* 댓글 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const comment: Comments = new Comments()
  const data = ctx.request.body
  let documentId: number = null

  try{
    /* 세션의 유저와 relation 설정 */
    comment.author = ctx.session.user

    /* commentId를 인자로 전달하면 대댓글 relation 설정 */
    if (typeof(data.commentId) === "number") {
      const parent: Comments = await conn
      .getRepository(Comments)
      .findOne(data.commentId, {
        relations: ["rootDocument"],
      })

      comment.rootComment = parent
      documentId = parent.rootDocument.id
    }

    /* 게시글과 relation 설정 */
    const document: Documents = await conn
    .getRepository(Documents)
    .findOneOrFail(documentId
      ? documentId : Number(data.documentId))

    comment.rootDocument = document

    /* 나머지 required 정보 입력 */
    comment.id = data.id
    comment.createdAt = data.createdAt
    comment.text = data.text

    await conn.manager.save(comment)

    /* 댓글 작성자의 댓글 수 1 증가 */
    ++(comment.author.numberOfComments)
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* POST 성공 응답 */
  ctx.body = comment
  ctx.response.status = 200
}

/* 해당 댓글 DELETE */
export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()
  const leaver: Users = await conn.getRepository(Users).findOne(0)

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comments = await conn
    .getRepository(Comments)
    .findOne(ctx.params.id, {
      relations: [
        "author",
        "likedBy",
      ]})

    /* 탈퇴한 유저 relation */
    comment.author = leaver
    await conn.manager.save(comment)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* DELETE 성공 응답 */
  ctx.response.status = 204
}

/* 해당 댓글 좋아요 GET */
export const GetLikes = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const comment: Comments = await conn
    .getRepository(Comments)
    .findOne(ctx.params.id, {
      relations: [
        "likedBy",
        "likedBy.profileImage",
      ]})

    ctx.body = comment.likedBy
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* GET 성공 응답 */
  ctx.response.status = 200
}

/* 해당 댓글 좋아요 POST */
export const PostLikes = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comments = await conn
    .getRepository(Comments)
    .findOne(ctx.params.id, {
      relations: ["likedBy"],
    })

    /* 세션의 유저와 좋아요 relation 설정 */
    comment.likedBy.push(ctx.session.user)
    await conn.manager.save(comment)

    /* 세션 유저의 댓글 좋아요 수 1 증가 */
    ++(ctx.session.user.numberOfCommentLikes)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* POST 성공 응답 */
  ctx.response.status = 200
}

/* 해당 댓글 좋아요 DELETE */
export const DeleteLikes = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comments = await conn
    .getRepository(Comments)
    .findOne(ctx.params.id)

    /* 세션의 유저와 좋아요 relation 해제 */
    await conn
    .createQueryBuilder()
    .relation(Comments, "likedBy")
    .of(comment)
    .remove(ctx.session.user)

    /* 세션 유저의 댓글 좋아요 수 1 감소 */
    --(comment.author.numberOfCommentLikes)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* DELETE 성공 응답 */
  ctx.response.status = 204
}
