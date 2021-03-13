import { Connection, getConnection } from "typeorm"
import File from "../entities/file"
import User from "../entities/user"

/* 해당 파일 GET */
export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const files: File = await conn
    .getRepository(File)
    .findOne(ctx.params.id)

    ctx.body = files
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}

/* 모든 파일 GET */
export const GetAll = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const files: File[] = await conn
    .getRepository(File)
    .find()

    ctx.body = files
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}

/* 파일 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const file: File = new File()
  const data = ctx.request.body

  file.filename = data.file
  // file.savedPath = "YO"
  file.savedPath = "images/YO.png"

  try {
    const user: User = ctx.state.token.user
    file.user = user
    await conn.manager.save(file)
  }
  catch (e){
    if (e.message ===
    "Cannot read property 'user' of undefined"){
      ctx.throw(401, e)
    }
    ctx.throw(400, e)
  }

  /* POST 완료 응답 */
  ctx.body = file
  ctx.response.status = 200
}

/* 해당 파일 DELETE */
export const DeleteOne =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 파일 불러오기 */
    const file: File = await conn
    .getRepository(File)
    .findOne(ctx.params.id)

    /* DB에서 파일 삭제 */
    await conn
    .createQueryBuilder()
    .delete()
    .from(File)
    .where("id = :id", { id: file.id })
    .execute()
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* DELETE 완료 응답 */
  ctx.response.status = 204
}
