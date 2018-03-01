import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import { ConnectionManager } from "typeorm/connection/ConnectionManager"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Users from "../entities/users"

/* Documents 테이블의 모든 값을 리턴함. */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()
  try{
    const document = await conn
      .getRepository(Documents)
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.author", "author")
      .leftJoinAndSelect("author.profileImage", "profileImage")
      .leftJoinAndSelect("document.comments", "comments")
      .where("document.id = :id", { id: ctx.params.id })
      .getOne()
    ctx.body = document
    
    /* Get 완료 응답 */
    ctx.response.status = 201
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* text를 POST 인자로 받아 DB에 저장함. */
export const Post = async (ctx, next) => {
  /* POST 인자를 data변수로 받음 */
  const data = ctx.request.body

     /* DB 커넥션풀에서 커넥션을 하나 가져옴. */
  const conn: Connection = getConnection()
  const userRepository = conn.getRepository(Users)

    /* documents 테이블 ORM 인스턴스 생성 */
  const documents: Documents = new Documents()
  documents.text = data.text
  documents.author = ctx.session

    /* DB에 저장 - 비동기 */
  try {
    await conn.manager.save(documents)
  }
  catch (e) {
      /* text가 인자에 없을 경우 400에러 리턴 */
    ctx.throw(400, e)
  }
    /* id와 created_at을 포함하여 body에 응답 */
  ctx.body = documents

  /* Post 완료 응답 */
  ctx.response.status = 201
}

/* documents 테이블에 존재하는 게시글 삭제 */
export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 게시글 불러오기 */
    const document = await conn
    .getRepository(Documents)
    .findOneById(ctx.params.id)

    const user = await conn
    .getRepository(Users)
    .findOneById(document.author.id)

    /* 게시글의 relation 해제 */
    await conn
    .createQueryBuilder()
    .relation(Documents, "likedBy")
    .of(document)
    .remove(user)

    await conn
    .createQueryBuilder()
    .relation(Documents, "author")
    .of(document)
    .set(user)

    /* 댓글 모두 삭제 */
    await conn
    .createQueryBuilder()
    .delete()
    .from(Comments)
    .where("rootDocumentId = :id", { id: document.id })
    .execute()

    /* DB에서 게시글 삭제 */
    await conn
    .createQueryBuilder()
    .delete()
    .from(Documents)
    .where("id = :id", { id: document.id })
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
  const likedBy = await conn
    .getRepository(Documents)
    .createQueryBuilder("document")
    .leftJoinAndSelect("document.likedBy", "likedBy")
    .getMany()
  ctx.body = likedBy

  /* Get 완료 응답 */
  ctx.response.status = 200
}

export const LikedBy = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const document: Documents = await conn
      .getRepository(Documents)
      .findOneById(ctx.params.id, { relations: ["likedBy"] })

    document.likedBy.push(ctx.session)
    await conn.manager.save(document)

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
    /* DB에서 게시글 불러오기 */
    const document = await conn
    .getRepository(Documents)
    .findOneById(ctx.params.id)

    /* 게시글과 유저의 좋아요 relation 해제 */
    await conn
    .createQueryBuilder()
    .relation(Documents, "likedBy")
    .of(document)
    .remove(ctx.session)

    /* 해제 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
