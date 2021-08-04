import { Connection, getConnection } from "typeorm"
import File from "../entities/file"
import User from "../entities/user"

/* 해당 파일 GET */
export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const file: File = await conn
      .getRepository(File)
      .findOne(ctx.params.id)

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      file
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }

}

/* 모든 파일 GET */
export const GetAll = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const files: File[] = await conn
      .getRepository(File)
      .find()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      files
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }

}

/* 파일 POST */
export const PostOne = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const user: User = ctx.state.token.user
    const files: File[] = await conn
      .getRepository(File)
      .find({ 
        relations: ["user"],
        where: {
          user: {
            id: user.id
          }
        }
      })
    const file = (files.length == 1) ? files[0] : new File()

    file.filename = ctx.file.filename
    file.savedPath = `/images/${ctx.file.filename}`
    file.user = user

    await conn.manager.save(file)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* POST 완료 응답 */
  ctx.response.status = 200
  ctx.body = {
    avatar: ctx.file.filename
  }
}

export const PostAll = async (ctx, next) => {
  /* POST 완료 응답 */
  ctx.response.status = 200
  ctx.body = {
    photos: ctx.files.map(file => file.filename)
  }
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
