import { Connection, getConnection, getManager } from "typeorm"
import Documents from "../entities/documents"

/* Documents 테이블의 모든 값을 리턴함. */
export const Get = async (ctx, next) => {
  const entityManager = getManager()
  ctx.body = await entityManager.find(Documents)
}

/* text를 POST 인자로 받아 DB에 저장함. */
export const Post = async (ctx, next) => {
  /* POST 인자를 data변수로 받음 */
  const data = ctx.request.body

  /* text가 인자로 들어왔을 경우 */
  if (data.text !== undefined) {

    /* DB 커넥션풀에서 커넥션을 하나 가져옴. */
    const conn: Connection = getConnection()

    /* documents 테이블 ORM 인스턴스 생성 */
    const documents: Documents = new Documents()
    documents.text = data.text

    /* DB에 저장 - 비동기 */
    await conn.manager.save(documents)

    /* id와 created_at을 포함하여 body에 응답 */
    ctx.body = documents
  }
  else {
    /* text가 인자에 없을 경우 400에러 리턴 */
    ctx.throw(400, "text required")
  }
}
