import * as crypto from "crypto"
import { Connection, getConnection } from "typeorm"
import Comment from "../entities/comment"
import Document from "../entities/document"
import File from "../entities/file"
import AuthenticationToken from "../entities/authenticationToken"
import User from "../entities/user"
import { Authenticate } from "../auth"

/* 인증된 유저 GET */
export const GetAuthenticated = async (ctx, next) => {
  const conn: Connection = getConnection()
  
  try {
    const user: User = await conn
      .getRepository(User)
      .findOne(ctx.state.token.user.id, {
        relations: ["profileImage"],
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      user
    }
  }
  catch (e) {
    ctx.throw(401, e)
  }
}

/* 해당 유저 GET */
export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const user: User = await conn
      .getRepository(User)
      .findOne(ctx.params.id, {
        relations: ["profileImage"],
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      user
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 모든 유저 GET */
export const GetAll = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const users: User[] = await conn
      .getRepository(User)
      .find({ relations: ["profileImage"] })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      users
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 유저 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const user: User = new User()
  const profile: File = new File()
  const data = ctx.request.body

  user.fullname = data.fullname
  user.nTh = data.nTh
  user.birthdate = data.birthdate
  user.username = data.username
  user.major = data.major
  user.studentNumber = data.studentNumber
  user.email = data.email
  user.phoneNumber = data.phoneNumber
  user.profileText = data.profileText
  user.favoriteComic = data.favoriteComic
  user.favoriteCharacter = data.favoriteCharacter

  const salt: Buffer = crypto.randomBytes(64)
  user.salt = salt.toString('hex')

  const derivedKey: Buffer = crypto.pbkdf2Sync(data.password, user.salt, 131071, 64, 'sha512')
  user.password = derivedKey.toString('hex')

  try {
    /* 데이터 저장 */
    await conn.manager.save(user)
  }
  catch (e) {
    if (e.message ===
      "SQLITE_CONSTRAINT: UNIQUE constraint failed: user.username"){
      ctx.throw(409, e)
    }
    ctx.throw(400, e)
  }

  /* 프로필 이미지 DB 저장 및 relation 설정 */
  try {
    profile.filename = data.profileImage.savedPath
    profile.savedPath = `/images/${data.profileImage.savedPath}`
    profile.user = user

    await conn.manager.save(profile)
  }
  catch (e) {
    await conn.manager.remove(user)
    ctx.throw(400, e)
  }

  try {
    const relationedUser: User = await conn
      .getRepository(User)
      .findOne(user.id, {
        relations: ["profileImage"],
      })

    /* POST 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      user: relationedUser
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 유저 DELETE */
export const DeleteOne =  async (ctx, next) => {
  const conn: Connection = getConnection()
  const leaver: User = await conn.getRepository(User).findOne(0)

  /* 코드 상에는 문제가 없어 텍스트를 throw함
    변경할 수 있으면 좋습니다. */
  if (ctx.params.id === 0) {
    ctx.throw(400, "삭제할 수 없는 유저입니다.")
  }

  try {
    /* DB에서 유저 불러오기 */
    const user: User = await conn
      .getRepository(User)
      .findOne(ctx.params.id)

    /* DB에서 유저 relation 모두 불러오기 */
    const comment: Comment[] = await conn
      .createQueryBuilder()
      .relation(User, "comment")
      .of(user)
      .loadMany()

    const document: Document[] = await conn
      .createQueryBuilder()
      .relation(User, "document")
      .of(user)
      .loadMany()

    const likedComments: Comment[] = await conn
      .createQueryBuilder()
      .relation(Comment, "likedUsers")
      .of(user.likedComments)
      .loadMany()

    const likedDocuments: Document[] = await conn
      .createQueryBuilder()
      .relation(Document, "likedUsers")
      .of(user.likedDocuments)
      .loadMany()

    /* 댓글 relation 해제 및 삭제 */
    for (const commentSet of comment.entries()) {
      const comment: Comment = await conn
        .getRepository(Comment)
        .findOne(commentSet["1"].id, {
          relations: ["author"],
        })

      /* 댓글 작성자의 댓글 수 1 감소 */
      --(comment.author.commentsCount)
      await conn.manager.save(comment.author)

      /* 탈퇴한 유저 relation */
      comment.author = leaver
      await conn.manager.save(comment)
    }

    /* 게시글 relation 해제 및 삭제 */
    for (const documentSet of document.entries()) {
      const document: Document = await conn
        .getRepository(Document)
        .findOne(documentSet["1"].id, {
          relations: ["author"],
        })

      /* 게시글 작성자의 게시글 수 1 감소 */
      --(document.author.documentsCount)

      /* 탈퇴한 유저 relation */
      document.author = leaver
      await conn.manager.save(document)
    }

    /* 좋아요한 컨텐츠 relation 해제 */
    for (const likedDocumentSet of likedDocuments.entries()) {
      const likedDocument: Document = likedDocumentSet["1"]

      await conn
        .createQueryBuilder()
        .relation(Document, "likedUsers")
        .of(likedDocument)
        .remove(user)
    }

    for (const likedCommentSet of likedComments.entries()) {
      const likedComment: Comment = likedCommentSet["1"]

      await conn
        .createQueryBuilder()
        .relation(Comment, "likedUsers")
        .of(likedComment)
        .remove(user)
    }

    /* relation 삭제 */
    await conn
      .createQueryBuilder()
      .delete()
      .from(File)
      .where("userId = :id", { id: user.id })
      .execute()

    await conn
      .createQueryBuilder()
      .delete()
      .from(AuthenticationToken)
      .where("userId = :id", { id: user.id })
      .execute()

    /* DB에서 유저 삭제 */
    await conn
      .createQueryBuilder()
      .delete()
      .from(User)
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

  try {
    const documents: Document[] = await conn
      .getRepository(Document)
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.author", "author")
      .where("author.id = :id", { id: ctx.params.id })
      .getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      documents
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 유저 댓글 GET */
export const GetComment = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const comment: Comment[] = await conn
      .getRepository(Comment)
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.author", "author")
      .where("author.id = :id", { id: ctx.params.id })
      .getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      comment
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 유저 PATCH */
export const PatchOne = async (ctx, next) => {
  const conn: Connection = getConnection()
  const data = ctx.request.body

  try {
    const user = await Authenticate(ctx.state.token.user.username, data.password)

    if (data.fullname !== undefined) {
      user.fullname = data.fullname
    }
    if (data.n_th !== undefined) {
      user.nTh = data.nTh
    }
    if (data.birthdate !== undefined) {
      user.birthdate = data.birthdate
    }
    if (data.major !== undefined) {
      user.major = data.major
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
    if (data.is_active !== undefined) {
      user.isActive = !user.isActive
    }
    if (data.profileImage !== undefined) {
      user.profileImage.filename = data.profileImage.savedPath
      user.profileImage.savedPath = `/images/${data.profileImage.savedPath}`
    }

    await conn.manager.save(user)
    
    /* PATCH 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      user
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 모든 유저의 활동인구 여부 수정 */
/* 모든 유저 PATCH */
export const PatchAll = async (ctx, next) => {
  const conn: Connection = getConnection()
  const data = ctx.request.body

  try {
    const allUsers: User[] = await conn
      .getRepository(User)
      .createQueryBuilder()
      .getMany()

    const onlyUsers: User[] = allUsers.slice(1, allUsers.length)

    for (const userSet of onlyUsers.entries()) {
      const user: User = userSet["1"]

      if (data.is_active !== undefined) {
        user.isActive = !user.isActive
      }
      await conn.manager.save(user)
    }

    /* PATCH 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      users: onlyUsers
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
