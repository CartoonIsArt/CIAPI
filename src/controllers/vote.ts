import { Connection, getConnection, LessThan, MoreThan } from "typeorm"
import Account from "../entities/account"
import Vote from "../entities/vote"
import Poll from "../entities/poll"

export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params

  try {
    const vote: Vote = await conn
      .getRepository(Vote)
      .findOne(id, {
        relations: [
          "polls",
          "polls.account",
          "polls.account.profile",
          "polls.account.student",
        ]
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      vote,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const GetAll = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const votes: Vote[] = await conn
      .getRepository(Vote)
      .find({
        relations: [
          "polls",
          "polls.account",
          "polls.account.profile",
          "polls.account.student",
        ]
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      votes,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const Post = async (ctx) => {
  const conn: Connection = getConnection()
  const { title, endTime, items } = ctx.request.body
  
  try {
    const vote: Vote = new Vote()
    vote.title = title
    vote.endTime = endTime
    vote.polls = []

    for (let i = 0; i < items.length; i++)
      vote[`item${i + 1}`] = items[i]

    await conn.manager.save(vote)

    /* GET 완료 응답 */
    ctx.response.status = 201
    ctx.body = {
      vote,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const Cast = async (ctx) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const { user } = ctx.state.token
  const { selection } = ctx.request.body
  
  try {
    const vote: Vote = await conn
      .getRepository(Vote)
      .findOne(id, {
        relations: [
          "polls",
          "polls.account",
          "polls.account.profile",
          "polls.account.student",
        ]
      })

    const account: Account = await conn
      .getRepository(Account)
      .findOne(user.id, {
        relations: ["profile", "student"],
      })

    const polls: Poll[] = await conn
      .getRepository(Poll)
      .find({
        relations: [
          "vote",
          "account",
          "account.profile",
          "account.student",
        ],
        where: {
          vote: {
            id: vote.id
          },
          account: {
            id: account.id,
          }
        }
      })
    
    let poll: Poll
    
    if (polls.length === 1) {
      poll = polls[0]
    }
    else {
      poll = new Poll()
      poll.vote = vote
      poll.account = account
    }
    poll.selection = selection

    await conn.manager.save(poll)

    /* GET 완료 응답 */
    ctx.response.status = 201
    ctx.body = {
      poll,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}