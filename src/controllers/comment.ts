import { Connection, getConnection } from "typeorm"
import Account, { MakeMinimizedResponseAccount } from "../entities/account"
import Comment from "../entities/comment"
import Document from "../entities/document"

/* 해당 댓글 GET */
export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params

  try {
    const comment: Comment = await conn
      .getRepository(Comment)
      .findOne(id, {
        relations: [
          "author",
          "author.profile",
          "author.student",
          "likedAccounts",
          "rootDocument",
          "rootComment",
          "comments",
        ]
      })

    /* GET 성공 응답 */
    ctx.response.status = 200
    ctx.body = {
      comment,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 댓글 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { user } = ctx.state.token
  const { documentId, commentId, content } = ctx.request.body

  try {
    /* 계정과 relation 설정 */
    const account: Account = await conn
      .getRepository(Account)
      .findOne(user.id, {
        relations: ["profile", "student"],
      })
      
    const comment: Comment = new Comment()
    comment.author = account
    comment.content = content
    comment.likedAccounts = []
    comment.comments = []

    if (commentId) { // 대댓글인 경우
      const parent: Comment = await conn
        .getRepository(Comment)
        .findOne(commentId, {
          relations: ["rootDocument"],
        })
      comment.rootComment = parent
    }
    else if (documentId) {
      const parent: Document = await conn
        .getRepository(Document)
        .findOne(documentId)
      comment.rootDocument = parent
    }

    /* 댓글 작성자의 댓글 수 1 증가 */
    ++(comment.author.commentsCount)

    await conn.manager.save([comment, comment.author])

    /* POST 성공 응답 */
    ctx.response.status = 201
    ctx.body = {
      comment,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 댓글 좋아요 GET */
export const GetLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params

  try {
    const comment: Comment = await conn
      .getRepository(Comment)
      .findOne(id, {
        relations: [
          "likedAccounts",
          "likedAccounts.student",
        ]
      })

    /* GET 성공 응답 */
    ctx.response.status = 200
    ctx.body = {
      likedAccounts: comment.likedAccounts.map(account => MakeMinimizedResponseAccount(account)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 댓글 좋아요 POST */
export const PostLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const tokenUser = ctx.state.token.user

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comment = await conn
      .getRepository(Comment)
      .findOne(id, {
        relations: [
          "likedAccounts",
          "likedAccounts.student",
        ]
      })

    /* 계정 불러오기 */
    const account: Account = await conn
      .getRepository(Account)
      .findOne(tokenUser.id, {
        relations: ["profile", "student"],
      })

    /* 계정과 좋아요 relation 설정 */
    ++(account.likedCommentsCount)
    comment.likedAccounts.push(account)

    await conn.manager.save([comment, account])

    /* POST 성공 응답 */
    ctx.response.status = 201
    ctx.body = {
      likedAccounts: comment.likedAccounts.map(account => MakeMinimizedResponseAccount(account)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 댓글 좋아요 PATCH */
export const CancelLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const user = ctx.state.token.user

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comment = await conn
      .getRepository(Comment)
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

    /* 댓글 좋아요 제거 */
    comment.likedAccounts = comment.likedAccounts.filter(likedAccount => likedAccount.id !== account.id)
    --(account.likedCommentsCount)
    await conn.manager.save([account, comment])

    /* PATCH 성공 응답 */
    ctx.response.status = 200
    ctx.body = {
      likedAccounts: comment.likedAccounts.map(account => MakeMinimizedResponseAccount(account)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
