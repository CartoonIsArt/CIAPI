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
    .findOne(ctx.params.id,{
      relations: [
        "author",
        "author.profileImage",
        "comments",
        "likedBy"
    ]})

    /* Get 완료 응답 */
    ctx.body = document
    ctx.response.status = 201
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 게시글 POST */
export const Post = async (ctx, next) => {
  /* POST 인자를 data변수로 받음 */
  const data = ctx.request.body

  /* DB 커넥션풀에서 커넥션을 하나 가져옴. */
  const conn: Connection = getConnection()

  /* document 테이블 ORM 인스턴스 생성 */
  const document: Documents = new Documents()

  document.text = data.text

  /* DB에 저장 - 비동기 */
  try {
    document.author = ctx.session.user
    ++(document.author.numberOfDocuments)
    await conn.manager.save(document.author)
  }
  catch (e) {
    /* text나 session.user가 없으면 400에러 리턴 */
    ctx.throw(400, e)
  }

  /* id와 created_at을 포함하여 body에 응답 */
  ctx.body = document

  /* Post 완료 응답 */
  ctx.response.status = 201
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
    --(document.author.numberOfDocuments)
    await conn.manager.save(document)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* 삭제 완료 응답 */
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
  ctx.body = likedBy

  /* Get 완료 응답 */
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

    ctx.response.status = 201
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* Post 완료 응답 */
  ctx.response.status = 201
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

    /* 해제 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
