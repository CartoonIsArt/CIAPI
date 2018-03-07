import { Connection, getConnection } from "typeorm"
import Comments from "../entities/comments"
import Documents from "../entities/documents"
import Files from "../entities/files"
import Sessions from "../entities/sessions"
import Users from "../entities/users"

/* 해당 유저 GET */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const user: Users = await conn
    .getRepository(Users)
    .findOne(ctx.params.id, {
      relations: ["profileImage"],
    })

    ctx.body = user
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}

/* 모든 유저 GET */
export const GetAll = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const users: Users[] = await conn
    .getRepository(Users)
    .find({ relations: ["profileImage"] })

    /* 0번 탈퇴한 유저 제외 */
    const onlyUsers: Users[] = users.slice(1, users.length)

    ctx.body = onlyUsers
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}

/* 유저 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const user: Users = new Users()
  const profile: Files = new Files()
  const data = ctx.request.body

  /* 데이터 저장 */
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

  /* 프로필 이미지 DB 저장 및 relation 설정 */
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
    const relationedUser: Users = await conn
    .getRepository(Users)
    .findOne(user.id, {
      relations: ["profileImage"],
    })

    ctx.body = relationedUser
  }
  catch (e){
    ctx.throw(400, e)
  }

  /* POST 완료 응답 */
  ctx.response.status = 200
}

/* 해당 유저 DELETE */
export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()
  const leaver: Users = await conn.getRepository(Users).findOne(0)

  try {
    /* DB에서 유저 불러오기 */
    const user: Users = await conn
    .getRepository(Users)
    .findOne(ctx.params.id)

    /* DB에서 유저 relation 모두 불러오기 */
    const comments: Comments[] = await conn
    .createQueryBuilder()
    .relation(Users, "comments")
    .of(user)
    .loadMany()

    const documents: Documents[] = await conn
    .createQueryBuilder()
    .relation(Users, "documents")
    .of(user)
    .loadMany()

    const likedComments: Comments[] = await conn
    .createQueryBuilder()
    .relation(Comments, "likedBy")
    .of(user.likedComments)
    .loadMany()

    const likedDocuments: Documents[] = await conn
    .createQueryBuilder()
    .relation(Documents, "likedBy")
    .of(user.likedDocuments)
    .loadMany()

    /* 댓글 relation 해제 및 삭제 */
    for (const commentSet of comments.entries()) {
      const comment: Comments = await conn
      .getRepository(Comments)
      .findOne(commentSet["1"].id, {
        relations: ["author"],
      })

      /* 댓글 작성자의 댓글 수 1 감소 */
      --(comment.author.numberOfComments)
      await conn.manager.save(comment.author)

      /* 탈퇴한 유저 relation */
      comment.author = leaver
      await conn.manager.save(comment)
    }

    /* 게시글 relation 해제 및 삭제 */
    for (const documentSet of documents.entries()) {
      const document: Documents = await conn
      .getRepository(Documents)
      .findOne(documentSet["1"].id, {
        relations: ["author"],
      })

      /* 게시글 작성자의 게시글 수 1 감소 */
      --(document.author.numberOfDocuments)

      /* 탈퇴한 유저 relation */
      document.author = leaver
      await conn.manager.save(document)
    }

    /* 좋아요한 컨텐츠 relation 해제 */
    for (const likedDocumentSet of likedDocuments.entries()) {
      const likedDocument: Documents = likedDocumentSet["1"]

      await conn
      .createQueryBuilder()
      .relation(Documents, "likedBy")
      .of(likedDocument)
      .remove(user)
    }

    for (const likedCommentSet of likedComments.entries()) {
      const likedComment: Comments = likedCommentSet["1"]

      await conn
      .createQueryBuilder()
      .relation(Comments, "likedBy")
      .of(likedComment)
      .remove(user)
    }

    /* relation 삭제 */
    await conn
    .createQueryBuilder()
    .delete()
    .from(Files)
    .where("userId = :id", { id: user.id })
    .execute()

    await conn
    .createQueryBuilder()
    .delete()
    .from(Sessions)
    .where("userId = :id", { id: user.id })
    .execute()

    /* DB에서 유저 삭제 */
    await conn
    .createQueryBuilder()
    .delete()
    .from(Users)
    .where("id = :id", { id: user.id })
    .execute()
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* 삭제 완료 응답 */
  ctx.response.status = 204
}

/* 해당 유저 게시글 GET */
export const GetDocuments = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const documents: Documents[] = await conn
    .getRepository(Documents)
    .createQueryBuilder("document")
    .leftJoinAndSelect("document.author", "author")
    .where("author.id = :id", { id: ctx.params.id })
    .getMany()

    ctx.body = documents
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}

/* 해당 유저 댓글 GET */
export const GetComments = async (ctx, next) => {
  const conn: Connection = getConnection()

  try{
    const comments: Comments[] = await conn
    .getRepository(Comments)
    .createQueryBuilder("comment")
    .leftJoinAndSelect("comment.author", "author")
    .where("author.id = :id", { id: ctx.params.id })
    .getMany()

    ctx.body = comments
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* GET 완료 응답 */
  ctx.response.status = 200
}

/* 해당 유저 PATCH */
export const Patch = async (ctx, next) => {
  const conn: Connection = getConnection()
  const data: Users = await conn
  .getRepository(Users)
  .findOne(ctx.params.id, {
    relations: ["profileImage"],
  })

  try{
    const user: Users = await conn
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
    ctx.body = user
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* PATCH 완료 응답 */
  ctx.request.status = 200
}
