import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import { ConnectionManager } from "typeorm/connection/ConnectionManager"
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
      .where("document.id = :id", { id: ctx.params.id })
      .getOne()
    ctx.body = document
    ctx.response.status = 200
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
  const user: Users = await userRepository.findOneById(1)

    /* documents 테이블 ORM 인스턴스 생성 */
  const documents: Documents = new Documents()
  documents.text = data.text
  documents.author = user

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
}
/* documents 테이블에 존재하는 게시글 삭제 */
export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const document = await conn
                      .getRepository(Documents)
                      .findOneById(ctx.params.id)
    await conn.manager.remove(document)
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
}

export const LikedBy = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const document: Documents = await conn
      .getRepository(Documents)
      .findOneById(ctx.params.id, { relations: ["likedBy"] })

    const user = await conn
                        .getRepository(Users)
                        .findOneById(1)

    document.likedBy.push(user)
    await conn.manager.save(document)

    ctx.response.status = 201
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const UnlikedBy = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const user = await conn
      .getRepository(Users)
      .findOneById(1)

    const document = await conn
                        .createQueryBuilder()
                        .delete()
                        .from(LikedBy)
                        .where("id = :id", { LikedBy })
                        .execute()
                        // .relation(Documents,"likedBy")
                        // .of(Documents)
                        // .remove(user)

                        // .getRepository(Documents)
                        // .findOneById(ctx.params.id)

    // await conn.manager.save(document)

    // document.likedBy = document.likedBy
    //    .filter(e => e.id !== ctx.params.id)
    ctx.response.status = 201
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
