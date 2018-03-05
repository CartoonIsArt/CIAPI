import { Connection, getConnection, getManager } from "typeorm"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Files from "../entities/files"
import Sessions from "../entities/sessions"
import Users from "../entities/users"

/* 해당 유저 GET */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    ctx.body = await conn
    .getRepository(Users)
    .findOne(ctx.params.id, ({ relations: ["profileImage"] }))
    ctx.response.status = 201
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* Get 완료 응답 */
  ctx.response.status = 201
}

/* 유저 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const user: Users = new Users()
  const profile: Files = new Files()
  const data = ctx.request.body

  /* 나머지 데이터를 DB에 저장 */
  user.fullname = data.fullname
  user.nTh = data.nTh
  user.dateOfBirth = data.dateOfBirth
  user.username = data.username
  user.password = data.password
  user.department = data.department
  user.studentNumber = data.studentNumber
  user.email = data.email
  user.phoneNumber = data.phoneNumber
  user.profileText = data.profileText
  user.favoriteComic = data.favoriteComic
  user.favoriteCharacter = data.favoriteCharacter

  try {
    await conn.manager.save(user)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* 프로필 이미지를 DB에 포함 및 relation을 구성 */
  if (data.profileImage !== undefined) {
    try {
      profile.file = data.profileImage
      profile.savedPath = "MIKI"
      profile.user = user

      await conn.manager.save(profile)
    }
    catch (e) {
      await conn.manager.remove(profile)
      ctx.throw(400, e)
    }
  }

  try{
    ctx.body = await conn
    .getRepository(Users)
    .findOne(user.id, { relations: ["profileImage"] })
  }
  catch (e){
    ctx.throw(400, e)
  }

  ctx.response.status = 200
}

/* 해당 유저 DELETE */
export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 유저 불러오기 */
    const user: Users = await conn
    .getRepository(Users)
    .findOne(ctx.params.id)

    /* DB에서 모든 게시글 불러오기 */
    const likedDocuments: Documents[] = await conn
    .createQueryBuilder()
    .relation(Documents, "likedBy")
    .of(user.documents)
    .loadMany()

    /* DB에서 모든 게시글의 댓글 불러오기 */
    const comments: Comments[] = await conn
    .createQueryBuilder()
    .relation(Documents, "comments")
    .of(user.documents)
    .loadMany()

    /* 모든 relation 해제 */
    await conn
    .createQueryBuilder()
    .relation(Documents, "likedBy")
    .of(likedDocuments)
    .remove(user)

    /* 모든 relation 삭제 */
    /* 수정중입니다
    for (const iter of comments) {
      await conn
      .createQueryBuilder()
      .relation(Comments, "likedBy")
      .of(iter)
      .remove(user)

      await conn
      .createQueryBuilder()
      .delete()
      .from(Comments)
      .where("rootCommentId = :id", { id: iter.id })
      .execute()
    }

    await conn
    .createQueryBuilder()
    .delete()
    .from(Documents)
    .where("authorId = :id", { id: user.id })
    .execute()

    await conn
    .createQueryBuilder()
    .delete()
    .from(Comments)
    .where("authorId = :id", { id: user.id })
    .execute()

    await conn
    .createQueryBuilder()
    .delete()
    .from(Files)
    .where("userId = :id", { id: user.id })
    .execute()

    /* DB에서 유저 삭제 */
    await conn
    .createQueryBuilder()
    .delete()
    .from(Sessions)
    .where("userId = :id", { id: user.id })
    .execute()

    await conn
    .createQueryBuilder()
    .delete()
    .from(Users)
    .where("id = :id", { id: user.id })
    .execute()

    /* 삭제 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 유저가 쓴 게시글 불러오기 */
export const GetDocuments = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    ctx.body = await conn
    .getRepository(Documents)
    .createQueryBuilder("document")
    .leftJoinAndSelect("document.author", "author")
    .where("author.id = :id", { id: ctx.params.id })
    .getMany()
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* Get 완료 응답 */
  ctx.response.status = 200
}

/* 유저가 쓴 댓글 불러오기 */
export const GetComments = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    ctx.body = await conn
    .getRepository(Comments)
    .createQueryBuilder("comment")
    .leftJoinAndSelect("comment.author", "author")
    .where("author.id = :id", { id: ctx.params.id })
    .getMany()
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* Get 완료 응답 */
  ctx.response.status = 200
}

export const Patch = async (ctx, next) => {
  const conn: Connection = getConnection()
  const data: Users = ctx.data

  try{
    const user = await conn
                      .getRepository(Users)
                      .findOne(ctx.params.id)
    if (data.fullname !== undefined) {
      user.fullname = data.fullname
    }
    if (data.nTh !== undefined) {
      user.nTh = data.nTh
    }
    if (data.dateOfBirth !== undefined) {
      user.dateOfBirth = data.dateOfBirth
    }
    if (data.department !== undefined) {
      user.department = data.department
    }
    if (data.studentNumber !== undefined) {
      user.studentNumber = data.studentNumber
    }
    if (data.email !== undefined) {
      user.email = data.email
    }
    if (data.phoneNumber !== undefined) {
      user.phoneNumber = data.phoneNumber
    }
    if (data.favoriteComic !== undefined) {
      user.favoriteComic = data.favoriteComic
    }
    if (data.favoriteCharacter !== undefined) {
      user.favoriteCharacter = data.favoriteCharacter
    }
    await conn.manager.save(user)
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
