import { Connection, getConnection } from "typeorm"
import Comment from "../entities/comment"
import Document from "../entities/document"
import User from "../entities/user"

/* 해당 댓글 GET */
export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { commentId } = ctx.params

  try {
    const comment: Comment = await conn
      .getRepository(Comment)
      .findOne(commentId, {
        relations: [
          "author",
          "author.profileImage",
          "rootDocument",
          "likedUsers",
          "comments",
          "rootComment",
        ]
      })

    /* GET 성공 응답 */
    ctx.response.status = 200
    ctx.body = comment
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 댓글 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const comment: Comment = new Comment()
  const { data } = ctx.request.body
  let documentId: number = null
  const tokenUser = ctx.state.token.user

  try {
    /* 유저 불러오기 */
    const user: User = await conn
      .getRepository(User)
      .findOne(tokenUser.id)

    /* 유저와 relation 설정 */
    comment.author = user

    /* commentId를 인자로 전달하면 대댓글 relation 설정 */
    if (typeof(data.commentId) === "number") {
      const parent: Comment = await conn
        .getRepository(Comment)
        .findOne(data.commentId, {
          relations: ["rootDocument"],
        })

      comment.rootComment = parent
      documentId = parent.rootDocument.id
    }

    /* 게시글과 relation 설정 */
    const document: Document = await conn
      .getRepository(Document)
      .findOneOrFail(documentId || Number(data.documentId))

    comment.rootDocument = document

    /* 나머지 required 정보 입력 */
    comment.id = data.id
    comment.createdAt = data.created_at
    comment.content = data.text
    comment.likedUsers = []

    /* 댓글 작성자의 댓글 수 1 증가 */
    ++(comment.author.commentsCount)

    await conn.manager.save(comment.author)
    await conn.manager.save(comment)

    /* POST 성공 응답 */
    ctx.response.status = 200
    ctx.body = comment
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 댓글 좋아요 GET */
export const GetLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { commentId } = ctx.params

  try{
    const comment: Comment = await conn
      .getRepository(Comment)
      .findOne(commentId, {
        relations: [
          "likedUsers",
          "likedUsers.profileImage",
        ]
      })

    /* GET 성공 응답 */
    ctx.response.status = 200
    ctx.body = { likedUsers: comment.likedUsers }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 댓글 좋아요 POST */
export const PostLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { commentId } = ctx.params
  const tokenUser = ctx.state.token.user

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comment = await conn
      .getRepository(Comment)
      .findOne(commentId, {
        relations: ["likedUsers"],
      })

    /* 유저 불러오기 */
    const user: User = await conn
      .getRepository(User)
      .findOne(tokenUser.id, {
        relations: ["profileImage"],
      })

    /* 유저와 좋아요 relation 설정 */
    ++(user.likedCommentsCount)
    comment.likedUsers.push(user)

    await conn.manager.save(comment)
    await conn.manager.save(user)

    /* POST 성공 응답 */
    ctx.response.status = 200
    ctx.body = {
      likedUsers: comment.likedUsers,
      user,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 댓글 좋아요 DELETE */
export const CalcelLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { commentId } = ctx.params
  const tokenUser = ctx.state.token.user

  try {
    /* DB에서 댓글 불러오기 */
    const comment: Comment = await conn
      .getRepository(Comment)
      .findOne(commentId, {
        relations: ["likedUsers"],
      })

    /* 유저 불러오기 */
    const user: User = await conn
      .getRepository(User)
      .findOne(tokenUser.id, {
        relations: ["profileImage"],
      })

    /* 유저와 좋아요 relation 해제 */
    await conn
      .createQueryBuilder()
      .relation(Comment, "likedUsers")
      .of(comment)
      .remove(user)

    /* 유저의 댓글 좋아요 수 1 감소 */
    --(user.likedCommentsCount)
    await conn.manager.save(user)

    /* DELETE 성공 응답 */
    ctx.response.status = 200
    ctx.body = {
      likedUsers: comment.likedUsers.filter(x => x.id != user.id),
      user,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
