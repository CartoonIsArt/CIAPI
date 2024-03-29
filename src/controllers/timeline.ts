import { Connection, getConnection, Like, SelectQueryBuilder, Brackets } from "typeorm"
import Document from "../entities/document"

/* 타임라인 GET */
export const GetTimeline = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { page, keyword } = ctx.query
  const query = Like(`%${keyword}%`)

  try {
    let queryBuilder: SelectQueryBuilder<Document> = conn
      .getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('author.student', 'student')
      .leftJoinAndSelect('document.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.profile', 'commentAuthorProfile')
      .leftJoinAndSelect('commentAuthor.student', 'commentAuthorStudent')
      .leftJoinAndSelect('comments.comments', 'recomments')
      .leftJoinAndSelect('recomments.author', 'recommentAuthor')
      .leftJoinAndSelect('recomments.likedAccounts', 'recommentLikedAccounts')
      .leftJoinAndSelect('recommentAuthor.profile', 'recommentAuthorProfile')
      .leftJoinAndSelect('recommentAuthor.student', 'recommentAuthorStudent')
      .leftJoinAndSelect('document.likedAccounts', 'documentsLikedAccounts')
      .leftJoinAndSelect('documentsLikedAccounts.student', 'documentsLikedAccountsStudent')
      .leftJoinAndSelect('comments.likedAccounts', 'commentsLikedAccounts')
      .leftJoinAndSelect('commentsLikedAccounts.student', 'commentsLikedAccountsStudent')
      .orderBy('document.id', 'DESC')
      .skip((page - 1) * 5)
      .take(5)
    
    if (keyword) {
      queryBuilder = queryBuilder
        .where(new Brackets(qb => {
          qb.where('author.username = :query', { query })
          qb.orWhere('commentAuthor.username = :query', { query })
          qb.orWhere('recommentAuthor.username = :query', { query })
          qb.orWhere('content = :query', { query })
          qb.orWhere('comments.content = :query', { query })
        }))
    }

    const timeline: Document[] = await queryBuilder.getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      timeline,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const GetUserTimeline = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { username } = ctx.params
  const { page, keyword } = ctx.query
  const query = Like(`%${keyword}%`)

  try {
    let queryBuilder: SelectQueryBuilder<Document> = conn
      .getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('author.student', 'student')
      .leftJoinAndSelect('document.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.profile', 'commentAuthorProfile')
      .leftJoinAndSelect('commentAuthor.student', 'commentAuthorStudent')
      .leftJoinAndSelect('comments.comments', 'recomments')
      .leftJoinAndSelect('recomments.author', 'recommentAuthor')
      .leftJoinAndSelect('recomments.likedAccounts', 'recommentLikedAccounts')
      .leftJoinAndSelect('recommentAuthor.profile', 'recommentAuthorProfile')
      .leftJoinAndSelect('recommentAuthor.student', 'recommentAuthorStudent')
      .leftJoinAndSelect('document.likedAccounts', 'documentsLikedAccounts')
      .leftJoinAndSelect('documentsLikedAccounts.student', 'documentsLikedAccountsStudent')
      .leftJoinAndSelect('comments.likedAccounts', 'commentsLikedAccounts')
      .leftJoinAndSelect('commentsLikedAccounts.student', 'commentsLikedAccountsStudent')
      .orderBy('document.id', 'DESC')
      .skip((page - 1) * 5)
      .take(5)
      .where('author.username = :username', { username })
    
    if (keyword) {
      queryBuilder = queryBuilder
        .andWhere(new Brackets(qb => {
          qb.where('commentAuthor.username = :query', { query })
          qb.orWhere('recommentAuthor.username = :query', { query })
          qb.orWhere('content = :query', { query })
          qb.orWhere('comments.content = :query', { query })
        }))
    }

    const timeline: Document[] = await queryBuilder.getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      timeline,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const GetLikedTimeline = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { username } = ctx.params
  const { page, keyword } = ctx.query
  const query = Like(`%${keyword}%`)

  try {
    let queryBuilder: SelectQueryBuilder<Document> = conn
      .getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('author.student', 'student')
      .leftJoinAndSelect('document.comments', 'comments')
      .leftJoinAndSelect('document.likedAccounts', 'likedAccounts')
      .leftJoinAndSelect('likedAccounts.student', 'likedAccountsStudent')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.profile', 'commentAuthorProfile')
      .leftJoinAndSelect('commentAuthor.student', 'commentAuthorStudent')
      .leftJoinAndSelect('comments.comments', 'recomments')
      .leftJoinAndSelect('recomments.author', 'recommentAuthor')
      .leftJoinAndSelect('recomments.likedAccounts', 'recommentLikedAccounts')
      .leftJoinAndSelect('recommentAuthor.profile', 'recommentAuthorProfile')
      .leftJoinAndSelect('recommentAuthor.student', 'recommentAuthorStudent')
      .leftJoinAndSelect('comments.likedAccounts', 'commentsLikedAccounts')
      .leftJoinAndSelect('commentsLikedAccounts.student', 'commentsLikedAccountsStudent')
      .orderBy('document.id', 'DESC')
      .skip((page - 1) * 5)
      .take(5)
      .where('likedAccounts.username = :username', { username })
    
    if (keyword) {
      queryBuilder = queryBuilder
        .andWhere(new Brackets(qb => {
          qb.where('author.username = :query', { query })
          qb.orWhere('recommentAuthor.username = :query', { query })
          qb.orWhere('content = :query', { query })
          qb.orWhere('comments.content = :query', { query })
        }))
    }

    const timeline: Document[] = await queryBuilder.getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      timeline,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const GetCommentedTimeline = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { username } = ctx.params
  const { page, keyword } = ctx.query
  const query = Like(`%${keyword}%`)

  try {
    let queryBuilder: SelectQueryBuilder<Document> = conn
      .getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('author.student', 'student')
      .leftJoinAndSelect('document.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.profile', 'commentAuthorProfile')
      .leftJoinAndSelect('commentAuthor.student', 'commentAuthorStudent')
      .leftJoinAndSelect('comments.comments', 'recomments')
      .leftJoinAndSelect('recomments.author', 'recommentAuthor')
      .leftJoinAndSelect('recomments.likedAccounts', 'recommentLikedAccounts')
      .leftJoinAndSelect('recommentAuthor.profile', 'recommentAuthorProfile')
      .leftJoinAndSelect('recommentAuthor.student', 'recommentAuthorStudent')
      .leftJoinAndSelect('document.likedAccounts', 'documentsLikedAccounts')
      .leftJoinAndSelect('documentsLikedAccounts.student', 'documentsLikedAccountsStudent')
      .leftJoinAndSelect('comments.likedAccounts', 'commentsLikedAccounts')
      .leftJoinAndSelect('commentsLikedAccounts.student', 'commentsLikedAccountsStudent')
      .orderBy('document.id', 'DESC')
      .skip((page - 1) * 5)
      .take(5)
      .where(new Brackets(qb => {
        qb.where('commentAuthor.username = :username', { username })
        qb.orWhere('recommentAuthor.username = :username', { username })
      }))
    
    if (keyword) {
      queryBuilder = queryBuilder
        .andWhere(new Brackets(qb => {
          qb.where('author.username = :query', { query })
          qb.orWhere('content = :query', { query })
          qb.orWhere('comments.content = :query', { query })
        }))
    }

    const timeline: Document[] = await queryBuilder.getMany()
    
    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      timeline,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
