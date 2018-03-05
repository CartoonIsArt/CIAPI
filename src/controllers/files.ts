import { Connection, getConnection, getManager } from "typeorm"
import Files from "../entities/files"
import Users from "../entities/users"

/* 모든 파일 GET */
export const Get = async (ctx, next) => {
  const entityManager = getManager()
  ctx.body = await entityManager.find(Files)
}

/* 파일 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const file: Files = new Files()
  const data = ctx.request.body

  file.file = data.file
  file.savedPath = "YO"

  try{
    await conn.manager.save(file)
  }
  catch (e){
    ctx.throw(400, e)
  }

  ctx.body = file
  ctx.response.status = 201
}

/* 해당 파일 DELETE */
export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 파일 불러오기 */
    const file: Files = await conn
    .getRepository(Files)
    .findOne(ctx.params.id)

    /* 파일의 relation 해제 *//*
    await conn
    .createQueryBuilder()
    .relation(Files, "user")
    .of(file)
    .set(null)

    /* DB에서 파일 삭제 */
    await conn
    .createQueryBuilder()
    .delete()
    .from(Files)
    .where("id = :id", { id: file.id })
    .execute()

    /* 삭제 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
