import { Connection, getConnection } from "typeorm"
import Cia from "../entities/cia"

/* 동아리 정보 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const cia: Cia = new Cia()
  const data = ctx.request.body

  cia.title = data.title
  cia.text = data.text

  try{
    await conn.manager.save(cia)
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* POST 완료 응답 */
  ctx.body = cia
  ctx.response.status = 200
}

/* 해당 동아리 정보 PATCH */
export const Patch = async (ctx, next) => {
  const conn: Connection = getConnection()
  const data = ctx.request.body

  try{
    /* name 문서를 찾아서 가져옴 */
    const cia: Cia = await conn
    .getRepository(Cia)
    .createQueryBuilder("cia")
    .where("cia.title = :title", { title: ctx.params.title })
    .getOne()

    /* 입력받은 값으로 수정 */
    cia.text = data.text

    await conn.manager.save(cia)
    ctx.body = cia
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* PATCH 완료 응답 */
  ctx.response.status = 200
}
