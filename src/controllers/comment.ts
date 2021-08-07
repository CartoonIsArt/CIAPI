import { Connection, getConnection } from "typeorm"
import Account, { MakeResponseAccount } from "../entities/account"
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
          "root_document",
          "liked_users",
          "comments",
          "root_comment",
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
  next()
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

    if (commentId) { // 대댓글인 경우
      const parent: Comment = await conn
        .getRepository(Comment)
        .findOne(commentId, {
          relations: ["root_document"],
        })
      comment.rootDocument = parent.rootDocument
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
  next()
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
          "likedAccounts.profile",
          "likedAccounts.student",
        ]
      })

    /* GET 성공 응답 */
    ctx.response.status = 200
    ctx.body = {
      likedAccounts: comment.likedAccounts.map(account => MakeResponseAccount(account)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
  next()
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
        relations: ["likedAccounts"],
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
      account,
      likedAccounts: comment.likedAccounts.map(account => MakeResponseAccount(account)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
  next()
}

/* 해당 댓글 좋아요 DELETE */
export const CalcelLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const tokenUser = ctx.state.token.user

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comment = await conn
      .getRepository(Comment)
      .findOne(id, {
        relations: ["likedAccounts"],
      })

    /* 계정 불러오기 */
    const user: Account = await conn
      .getRepository(Account)
      .findOne(tokenUser.id, {
        relations: ["profile", "student"],
      })

    /* 계정과 좋아요 relation 해제 */
    await conn
      .createQueryBuilder()
      .relation(Comment, "likedAccounts")
      .of(comment)
      .remove(user)

    /* 계정의 댓글 좋아요 수 1 감소 */
    --(user.likedCommentsCount)
    await conn.manager.save(user)

    /* DELETE 성공 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
