import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import { ConnectionManager } from "typeorm/connection/ConnectionManager"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Users from "../entities/users"

// 유저의 게시글 수, 게시글 좋아요 개수 카운트
// 게시글 GET을 relation을 이용하여 불러오기

/* 해당 게시글 GET */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()
  try{
    const document = await conn
    .getRepository(Documents)
    .createQueryBuilder("document")
    .leftJoinAndSelect("document.author", "author")
    .leftJoinAndSelect("author.profileImage", "profileImage")
    .leftJoinAndSelect("document.comments", "comments")
    .leftJoinAndSelect("document.likedBy", "likedBy")
    .where("document.id = :id", { id: ctx.params.id })
    .getOne()

    /* GET 완료 응답 */
    ctx.body = document
    ctx.response.status = 200
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 게시글 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const document: Documents = new Documents()
  const data = ctx.request.body

  document.text = data.text

  try {
    document.author = ctx.session.user
    await conn.manager.save(document)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* POST 완료 응답 */
  ctx.body = document
  ctx.response.status = 200
}

/* 해당 게시글 DELETE */
export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()
  const leaver: Users = await conn.getRepository(Users).findOne(0)

  try {
    /* DB에서 게시글 불러오기 */
    const document: Documents = await conn
    .getRepository(Documents)
    .findOne(ctx.params.id)

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

// 하나만 불러오게 수정해주세요
/* 해당 게시글 좋아요 GET */
export const GetLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const likedBy: Documents[] = await conn
  .getRepository(Documents)
  .createQueryBuilder("document")
  .leftJoinAndSelect("document.likedBy", "likedBy")
  .getMany()

  /* GET 완료 응답 */
  ctx.body = likedBy
  ctx.response.status = 200
}

/* 해당 게시글 좋아요 POST */
export const PostLikes = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const document: Documents = await conn
    .getRepository(Documents)
    .findOne(ctx.params.id, { relations: ["likedBy"] })

    document.likedBy.push(ctx.session.user)
    await conn.manager.save(document)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* POST 완료 응답 */
  ctx.response.status = 200
}

/* 해당 게시글 좋아요 DELETE */
export const DeleteLikes = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 게시글 불러오기 */
    const document: Documents = await conn
    .getRepository(Documents)
    .findOne(ctx.params.id)

    /* 게시글과 유저의 좋아요 relation 해제 */
    await conn
    .createQueryBuilder()
    .relation(Documents, "likedBy")
    .of(document)
    .remove(ctx.session.user)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* DELETE 완료 응답 */
  ctx.response.status = 204
}
