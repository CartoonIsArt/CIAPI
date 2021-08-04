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
      .leftJoinAndSelect('author.profileImage', 'profileImage')
      .leftJoinAndSelect('document.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.profileImage', 'commentAuthorProfileImage')
      .leftJoinAndSelect('comments.comments', 'replies')
      .leftJoinAndSelect('replies.author', 'repliyAuthor')
      .leftJoinAndSelect('document.likedUsers', 'likedUsers')
      .leftJoinAndSelect('comments.likedUsers', 'commentsLikedUsers')
      .orderBy('document.id', 'DESC')
      .skip((page - 1) * 5)
      .take(5)
    
    if (keyword) {
      queryBuilder = queryBuilder
        .where(new Brackets(qb => {
          qb.where('author.username = :query', { query })
          qb.orWhere('commentAuthor.username = :query', { query })
          qb.orWhere('repliyAuthor.username = :query', { query })
          qb.orWhere('content = :query', { query })
          qb.orWhere('comments.content = :query', { query })
        }))
    }

    const timeline: Document[] = await queryBuilder.getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      timeline
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
      .leftJoinAndSelect('author.profileImage', 'profileImage')
      .leftJoinAndSelect('document.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.profileImage', 'commentAuthorProfileImage')
      .leftJoinAndSelect('comments.comments', 'replies')
      .leftJoinAndSelect('replies.author', 'repliyAuthor')
      .leftJoinAndSelect('document.likedUsers', 'likedUsers')
      .leftJoinAndSelect('comments.likedUsers', 'commentsLikedUsers')
      .orderBy('document.id', 'DESC')
      .skip((page - 1) * 5)
      .take(5)
      .where('author.username = :username', { username })
    
    if (keyword) {
      queryBuilder = queryBuilder
        .andWhere(new Brackets(qb => {
          qb.where('commentAuthor.username = :query', { query })
          qb.orWhere('repliyAuthor.username = :query', { query })
          qb.orWhere('content = :query', { query })
          qb.orWhere('comments.content = :query', { query })
        }))
    }

    const timeline: Document[] = await queryBuilder.getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      timeline
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
      .leftJoinAndSelect('author.profileImage', 'profileImage')
      .leftJoinAndSelect('document.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.profileImage', 'commentAuthorProfileImage')
      .leftJoinAndSelect('comments.comments', 'replies')
      .leftJoinAndSelect('replies.author', 'repliyAuthor')
      .leftJoinAndSelect('document.likedUsers', 'likedUsers')
      .leftJoinAndSelect('comments.likedUsers', 'commentsLikedUsers')
      .orderBy('document.id', 'DESC')
      .skip((page - 1) * 5)
      .take(5)
      .where('likedUsers.username = :username', { username })
    
    if (keyword) {
      queryBuilder = queryBuilder
        .andWhere(new Brackets(qb => {
          qb.where('author.username = :query', { query })
          qb.orWhere('repliyAuthor.username = :query', { query })
          qb.orWhere('content = :query', { query })
          qb.orWhere('comments.content = :query', { query })
        }))
    }

    const timeline: Document[] = await queryBuilder.getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      timeline
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
      .leftJoinAndSelect('author.profileImage', 'profileImage')
      .leftJoinAndSelect('document.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.profileImage', 'commentAuthorProfileImage')
      .leftJoinAndSelect('comments.comments', 'replies')
      .leftJoinAndSelect('replies.author', 'repliyAuthor')
      .leftJoinAndSelect('document.likedUsers', 'likedUsers')
      .leftJoinAndSelect('comments.likedUsers', 'commentsLikedUsers')
      .orderBy('document.id', 'DESC')
      .skip((page - 1) * 5)
      .take(5)
      .where(new Brackets(qb => {
        qb.where('commentAuthor.username = :username', { username })
        qb.orWhere('repliyAuthor.username = :username', { username })
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
      timeline
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
