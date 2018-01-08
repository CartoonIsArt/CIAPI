import { Connection, getConnection, getManager } from "typeorm"
import Cia from "../entities/cia"

/* cia를 POST인자로 받아 DB에 저장함 */
export const Post = async (ctx, next) => {
  /* POST인자를 data변수를 받음 */
  const data = ctx.request.body

  /* cia가 인자로 들어왔을 경우 */
  /* DB 커넥션풀에서 커넥션을 하나 가져옴 */
  const conn: Connection = getConnection()

  /* Cia 테이블 ORM 인스턴스 생성*/
  const cia: Cia = new Cia()
  cia.name = data.name

  cia.value = data.value

  /* DB에 저장 - 비동기 */
  try{
    await conn.manager.save(cia)
  }
  catch (e){
    /* cia에 인자가 없을 경우 400에러 리턴 */
    ctx.throw(400, e)
  }
  /* id를 포함하여 body에 응답 */
  ctx.body = cia
}

/* cia를 PATCH인자로 받아 DB에 저장함 */
export const Patch = async (ctx, next) => {
  /* PATCH인자를 data변수를 받음 */
  const data = ctx.request.body

  /* cia가 인자로 들어왔을 경우 */
  /* DB커넥션풀에서 커넥션을 하나 가져옴 */
  const conn: Connection = getConnection()

  try{
    /* name 문서를 찾아서 가져옴 */
    const cia = await conn.getRepository(Cia).createQueryBuilder("cia").where("cia.name = :name", {name : ctx.params.name}).getOne();

    /* 입력받은 값으로 수정 */
    cia.value = data.value

    await conn.manager.save(cia)
    /* id를 포함하여 body에 응답 */
    ctx.body=cia
  }
  catch(e){
    /* cia에 인자가 없을 경우 400에러 리턴 */
    ctx.throw(400, e)
  }

}
