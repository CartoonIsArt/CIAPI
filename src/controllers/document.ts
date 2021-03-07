import { Connection, getConnection } from "typeorm"
import Document from "../entities/document"
import User from "../entities/user"

/* 해당 게시글 GET */
export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const document: Document = await conn
    .getRepository(Document)
    .findOne(ctx.params.id, {
      relations: [
        "author",
        "author.profileImage",
        "comment",
        "comment.author",
        "comment.author.profileImage",
        "comment.comments",
        "comment.likedUsers",
        "likedUsers",
      ]})

    ctx.body = document
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}

/* 게시글 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const document: Document = new Document()

  try {
    // ctx.state.token.user 바로 저장이 안됨
    document.author = await conn
    .getRepository(User)
    .findOne(ctx.state.token.user.id, {
      relations: ['profileImage']
    })
    document.content = ctx.request.body.data

    /* 게시글 작성자의 게시글 수 1 증가 */
    ++(document.author.documentsCount)

    await conn.manager.save(document.author)
    await conn.manager.save(document)
  }
  catch (e) {
    if (e.message ===
    "Cannot read property 'user' of undefined"){
      ctx.throw(401, e)
    }
    ctx.throw(400, e)
  }

  /* POST 완료 응답 */
  ctx.body = document
  ctx.response.status = 200
}

/* 해당 게시글 DELETE */
export const DeleteOne =  async (ctx, next) => {
  const conn: Connection = getConnection()
  const leaver: User = await conn.getRepository(User).findOne(0)

  try {
    /* DB에서 게시글 불러오기 */
    const document: Document = await conn
    .getRepository(Document)
    .findOne(ctx.params.id, {
      relations: ["author"],
    })

    /* 게시글 작성자의 게시글 수 1 감소 */
    --(document.author.documentsCount)

    /* 탈퇴한 유저 relation */
    document.author = leaver
    await conn.manager.save(document)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* DELETE 완료 응답 */
  ctx.response.status = 204
}

/* 해당 게시글 PATCH */
export const PatchOne = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const document: Document = await conn
    .getRepository(Document)
    .findOne(ctx.params.id, {
      relations: [
        "author",
        "author.profileImage",
        "comment",
        "comment.author",
        "comment.author.profileImage",
        "comment.comments",
        "comment.likedUsers",
        "likedUsers",
      ]})

    document.content += "\n\n" + ctx.request.body.data

    await conn.manager.save(document)

    /* PATCH 완료 응답 */
    ctx.body = document
    ctx.response.status = 200
  }
  catch (e){
    ctx.throw(400, e)
  }
}

/* 해당 게시글 좋아요 GET */
export const GetLikes = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const document: Document = await conn
    .getRepository(Document)
    .findOne(ctx.params.id, {
      relations: [
        "likedUsers",
        "likedUsers.profileImage",
      ]})

    ctx.body = document.likedUsers
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}

/* 해당 게시글 좋아요 POST */
export const PostLikes = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 게시글 불러오기 */
    const document: Document = await conn
    .getRepository(Document)
    .findOne(ctx.params.id, {
      relations: ["likedUsers"],
    })

    /* 세션 유저 불러오기 */
    const user: User = ctx.state.token.user

    /* 게시글과 유저의 좋아요 relation 설정 */
    document.likedUsers.push(user)
    ++(user.likedDocumentsCount)

    await conn.manager.save(user)
    await conn.manager.save(document)

    /* POST 완료 응답 */
    ctx.body = document.likedUsers
    ctx.response.status = 200
  }
  catch (e) {
    if (e.message ===
    "Cannot read property 'user' of undefined"){
      ctx.throw(401, e)
    }
    ctx.throw(400, e)
  }
}

/* 해당 게시글 좋아요 DELETE */
export const CancelLikes = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 게시글 불러오기 */
    const document: Document = await conn
    .getRepository(Document)
    .findOne(ctx.params.id)

    /* 세션 유저 불러오기 */
    const user: User = ctx.state.token.user

    /* 게시글과 유저의 좋아요 relation 해제 */
    await conn
    .createQueryBuilder()
    .relation(Document, "likedUsers")
    .of(document)
    .remove(user)

    /* 게시글에 좋아요한 수 1 감소 */
    --(user.likedDocumentsCount)
    await conn.manager.save(user)
  }
  catch (e) {
    if (e.message ===
    "Cannot read property 'user' of undefined"){
      ctx.throw(401, e)
    }
    ctx.throw(400, e)
  }

  /* DELETE 완료 응답 */
  ctx.response.status = 204
}
