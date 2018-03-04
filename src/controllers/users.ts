import { Connection, getConnection, getManager } from "typeorm"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Files from "../entities/files"
import Users from "../entities/users"

/* 유저 테이블의 모든 값을 리턴함. */
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

/* fullname을 POST 인자로 받아 DB에 저장함. */
export const Post = async (ctx, next) => {
  /* POST 인자를 data변수로 받음 */
  const data = ctx.request.body

  /* DB 커넥션풀에서 커넥션을 하나 가져옴. */
  const conn: Connection = getConnection()

  /* Users 테이블 ORM 인스턴스 생성 */
  const user: Users = new Users()
  user.profileImage = null

  /* 프로필 이미지를 DB에 포함 및 relation을 구성 */
  if (data.profileImage !== undefined) {
    const profile = new Files()
    profile.file = data.profileImage
    profile.savedPath = "MIKI"

    try {
      /* DB에 저장 - 비동기 */
      await conn.manager.save(profile)
    }
    catch (e) {
      /* profile 저장 실패 시 400에러 리턴 */
      ctx.throw(400, e)
    }
    user.profileImage = profile
  }

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
    /* DB에 저장 - 비동기 */
    await conn.manager.save(user)
  }
  catch (e) {
    /* required member중 하나라도 인자에 없을 경우 400에러 리턴 - 수정*/
    ctx.throw(400, e)
  }

  /* id를 포함하여 body에 응답 */
  ctx.body = user
}

export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    /* DB에서 유저 불러오기 */
    const user = await conn
    .getRepository(Users)
    .findOne(ctx.params.id)

    /* DB에서 모든 게시글 불러오기 */
    const likedDocuments = await conn
    .createQueryBuilder()
    .relation(Documents, "likedBy")
    .of(user.documents)
    .loadMany()

    /* 모든 게시글의 좋아요 해제 */
    await conn
    .createQueryBuilder()
    .relation(Documents, "likedBy")
    .of(likedDocuments)
    .remove(user)

    /* relation 모두 삭제 */
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
    .where("userId = :id", { id: user.id })
    .execute()

    await conn
    .createQueryBuilder()
    .delete()
    .from(Users)
    .where("profileImageId = :id", { id: user.id })
    .execute()

    /* DB에서 유저 삭제 */
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
