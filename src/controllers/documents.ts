import { Connection, getConnection } from "typeorm"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Users from "../entities/users"

/* 해당 게시글 GET */
export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const document: Documents = await conn
    .getRepository(Documents)
    .findOne(ctx.params.id, {
      relations: [
        "author",
        "author.profileImage",
        "comments",
        "comments.author",
        "comments.author.profileImage",
        "comments.replies",
        "comments.likedBy",
        "likedBy",
      ]})

    ctx.body = document
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}

/* 타임라인 읽기 - 모든 게시글 GET */
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

/* 게시글 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const document: Documents = new Documents()
  const data = ctx.request.body

  try {
    document.author = ctx.session.user
    document.text = data.text

    /* 게시글 작성자의 게시글 수 1 증가 */
    ++(document.author.nDocuments)

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
  const leaver: Users = await conn.getRepository(Users).findOne(0)

  try {
    /* DB에서 게시글 불러오기 */
    const document: Documents = await conn
    .getRepository(Documents)
    .findOne(ctx.params.id, {
      relations: ["author"],
    })

    /* 게시글 작성자의 게시글 수 1 감소 */
    --(document.author.nDocuments)

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
  const data = ctx.request.body

  try{
    const document: Documents = await conn
    .getRepository(Documents)
    .findOne(ctx.params.id, {
      relations: [
        "author",
        "author.profileImage",
        "comments",
        "comments.author",
        "comments.author.profileImage",
        "comments.replies",
        "comments.likedBy",
        "likedBy",
      ]})

    document.text += "\n\n" + data.text

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
    const document: Documents = await conn
    .getRepository(Documents)
    .findOne(ctx.params.id, {
      relations: [
        "likedBy",
        "likedBy.profileImage",
      ]})

    ctx.body = document.likedBy
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
    const document: Documents = await conn
    .getRepository(Documents)
    .findOne(ctx.params.id, {
      relations: ["likedBy"],
    })

    /* 세션 유저 불러오기 */
    const user: Users = ctx.session.user

    /* 게시글과 유저의 좋아요 relation 설정 */
    document.likedBy.push(user)
    ++(user.nDocumentLikes)

    await conn.manager.save(user)
    await conn.manager.save(document)

    /* POST 완료 응답 */
    ctx.body = document.likedBy
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
    const document: Documents = await conn
    .getRepository(Documents)
    .findOne(ctx.params.id)

    /* 세션 유저 불러오기 */
    const user: Users = ctx.session.user

    /* 게시글과 유저의 좋아요 relation 해제 */
    await conn
    .createQueryBuilder()
    .relation(Documents, "likedBy")
    .of(document)
    .remove(user)

    /* 게시글에 좋아요한 수 1 감소 */
    --(user.nDocumentLikes)
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
