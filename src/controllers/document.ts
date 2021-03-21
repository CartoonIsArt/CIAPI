import { Connection, getConnection } from "typeorm"
import Document from "../entities/document"
import User from "../entities/user"

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
          "author.profileImage",
          "comment",
          "comment.author",
          "comment.author.profileImage",
          "comment.comments",
          "comment.likedUsers",
          "likedUsers",
        ]
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = { document }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 게시글 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const document: Document = new Document()
  const tokenUser = ctx.state.token.user
  const { content } = ctx.request.body

  try {
    document.author = await conn
      .getRepository(User)
      .findOne(tokenUser.id, {
        relations: ['profileImage']
      })
    document.content = content
    document.comments = []
    document.likedUsers = []

    /* 게시글 작성자의 게시글 수 1 증가 */
    ++(document.author.documentsCount)

    await conn.manager.save(document.author)
    await conn.manager.save(document)

    /* POST 완료 응답 */
    ctx.response.status = 200
    ctx.body = { document }
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
          "author.profileImage",
          "comments",
          "comments.author",
          "comments.author.profileImage",
          "comments.comments",
          "comments.likedUsers",
          "likedUsers",
        ]
      })
      console.log(id, content, document.content)

    document.content += "\n\n" + content

    await conn.manager.save(document)

    /* PATCH 완료 응답 */
    ctx.response.status = 200
    ctx.body = { document }
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
          "likedUsers",
          "likedUsers.profileImage",
        ]
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = { likedUsers: document.likedUsers }
  }
  catch (e) {
    ctx.throw(400, e)
  }

}

/* 해당 게시글 좋아요 POST */
export const PostLikes = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const tokenUser = ctx.state.token.user

  try {
    /* DB에서 게시글 불러오기 */
    const document: Document = await conn
      .getRepository(Document)
      .findOne(id, {
        relations: ["likedUsers"],
      })

    /* 유저 불러오기 */
    const user: User = await conn
      .getRepository(User)
      .findOne(tokenUser.id, {
        relations: ["profileImage"],
      })

    /* 게시글과 유저의 좋아요 relation 설정 */
    ++(user.likedDocumentsCount)
    document.likedUsers.push(user)

    await conn.manager.save(user)
    await conn.manager.save(document)

  /* POST 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      likedUsers: document.likedUsers,
      user,
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
  const tokenUser = ctx.state.token.user

  try {
    /* DB에서 게시글 불러오기 */
    const document: Document = await conn
      .getRepository(Document)
      .findOne(id, {
        relations: ["likedUsers"],
      })

    /* 유저 불러오기 */
    const user: User = await conn
      .getRepository(User)
      .findOne(tokenUser.id, {
        relations: ["profileImage"],
      })

    /* 게시글과 유저의 좋아요 relation 해제 */
    await conn
      .createQueryBuilder()
      .relation(Document, "likedUsers")
      .of(document)
      .remove(user)

    /* 게시글에 좋아요한 수 1 감소 */
    --(user.likedDocumentsCount)
    await conn.manager.save(user)

    /* DELETE 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      likedUsers: document.likedUsers.filter(x => x.id != user.id),
      user,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }

}
