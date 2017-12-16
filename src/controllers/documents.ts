import { Connection, getConnection, getConnectionManager, getManager } from "typeorm"
import Documents from "../entities/documents"
import Users from "../entities/users"

/* Documents 테이블의 모든 값을 리턴함. */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()
  const document = await conn
    .getRepository(Documents)
    .createQueryBuilder("document")
    .leftJoinAndSelect("document.author", "author")
    .leftJoinAndSelect("author.profileImage", "profileImage")
    .getMany()
  ctx.body = document
}

/* text를 POST 인자로 받아 DB에 저장함. */
export const Post = async (ctx, next) => {
  /* POST 인자를 data변수로 받음 */
  const data = ctx.request.body

     /* DB 커넥션풀에서 커넥션을 하나 가져옴. */
  const conn: Connection = getConnection()
  const userRepository = conn.getRepository(Users)
  const user: Users = await userRepository.findOneById(data.userId)
  ctx.body.file = await conn
  .getRepository(Users)
  .find({ relations: ["profileImage"] })
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
    ctx.throw(400, "text required")
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
