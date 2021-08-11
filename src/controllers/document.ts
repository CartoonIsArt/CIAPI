import { Connection, getConnection } from "typeorm"
import Account, { MakeMinimizedResponseAccount } from "../entities/account"
import Document from "../entities/document"

/* 해당 게시글 GET */
export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params

  try {
    const document: Document = await conn
      .getRepository(Document)
      .findOne(id, {
        relations: [
          "author",
          "author.profile",
          "author.student",
          "comment",
          "comment.author",
          "comment.author.profile",
          "comment.author.student",
          "comment.comments",
          "comment.likedAccounts",
          "likedAccounts",
        ]
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      document,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 게시글 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const document: Document = new Document()
  const { user } = ctx.state.token
  const { content } = ctx.request.body

  try {
    document.author = await conn
      .getRepository(Account)
      .findOne(user.id, {
        relations: ["profile", "student"],
      })
    document.content = content
    document.comments = []
    document.likedAccounts = []

    /* 게시글 작성자의 게시글 수 1 증가 */
    ++(document.author.documentsCount)

    await conn.manager.save(document.author)
    await conn.manager.save(document)

    /* POST 완료 응답 */
    ctx.response.status = 201
    ctx.body = {
      document,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 게시글 PATCH */
export const PatchOne = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id, content } = ctx.request.body

  try {
    const document: Document = await conn
      .getRepository(Document)
      .findOne(id, {
        relations: [
          "author",
          "author.profile",
          "author.student",
          "comment",
          "comment.author",
          "comment.author.profile",
          "comment.author.student",
          "comment.comments",
          "comment.likedAccounts",
          "likedAccounts",
        ]
      })
    document.content += "\n\n" + content

    await conn.manager.save(document)

    /* PATCH 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 게시글 좋아요 GET */
export const GetLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params

  try {
    const document: Document = await conn
      .getRepository(Document)
      .findOne(id, {
        relations: [
          "likedAccounts",
          "likedAccounts.student",
        ]
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      likedAccounts: document.likedAccounts.map(account => MakeMinimizedResponseAccount(account)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 게시글 좋아요 POST */
export const PostLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const { user } = ctx.state.token

  try {
    /* DB에서 게시글 불러오기 */
    const document: Document = await conn
      .getRepository(Document)
      .findOne(id, {
        relations: [
          "likedAccounts",
          "likedAccounts.student",
        ]
      })

    /* 계정 불러오기 */
    const account: Account = await conn
      .getRepository(Account)
      .findOne(user.id, {
        relations: ["profile", "student"],
      })

    /* 게시글과 계정의 좋아요 relation 설정 */
    ++(account.likedDocumentsCount)
    document.likedAccounts.push(account)

    await conn.manager.save([account, document])

  /* POST 완료 응답 */
    ctx.response.status = 201
    ctx.body = {
      account,
      likedAccounts: document.likedAccounts.map(account => MakeMinimizedResponseAccount(account)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 게시글 좋아요 DELETE */
export const CancelLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const { user } = ctx.state.token

  try {
    /* DB에서 게시글 불러오기 */
    const document: Document = await conn
      .getRepository(Document)
      .findOne(id, {
        relations: [
          "likedAccounts",
          "likedAccounts.student",
        ]
      })

    /* 계정 불러오기 */
    const account: Account = await conn
      .getRepository(Account)
      .findOne(user.id, {
        relations: ["profile", "student"],
      })

    /* 게시글 좋아요 제거 */
    document.likedAccounts = document.likedAccounts.filter(likedAccount => likedAccount.id !== account.id)
    --(account.likedDocumentsCount)
    await conn.manager.save([account, document])

    /* DELETE 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      account,
      likedAccounts: document.likedAccounts.map(account => MakeMinimizedResponseAccount(account)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
