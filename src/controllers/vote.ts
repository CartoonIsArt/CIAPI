import { Connection, EntityManager, getConnection, LessThan, MoreThan } from "typeorm"
import Account from "../entities/account"
import Vote, { MakeResponseVote, MakeResponseVoteItems, MakeResponseVoteResult } from "../entities/vote"
import Poll from "../entities/poll"

const SelectionQueryBuilder = (manager: EntityManager, id: number, userId: number, selection: number) => (
  ResultQueryBuilder(manager, id, selection)
    .innerJoinAndSelect('poll.account', 'account')
    .andWhere('account.id = :userId', { userId })
)

const ResultQueryBuilder = (manager: EntityManager, id: number, selection: number) => (
  manager
    .createQueryBuilder(Poll, 'poll')
    .innerJoinAndSelect('poll.vote', 'vote')
    .where('vote.id = :id', { id })
    .andWhere('poll.selection & :selection', { selection })
)

export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const { user } = ctx.state.token

  try {
    await conn.manager.transaction(async manager => {
      const vote: Vote = await manager
        .getRepository(Vote)
        .findOne(id, {
          relations: [
            "polls",
            "polls.account",
            "polls.account.profile",
            "polls.account.student",
          ]
        })
      const selections = []
      await SelectionQueryBuilder(manager, id, user.id, 1).getCount() && selections.push(0)
      await SelectionQueryBuilder(manager, id, user.id, 2).getCount() && selections.push(1)
      await SelectionQueryBuilder(manager, id, user.id, 4).getCount() && selections.push(2)
      await SelectionQueryBuilder(manager, id, user.id, 8).getCount() && selections.push(3)
      const result = [
        await ResultQueryBuilder(manager, id, 1).getCount(),
        await ResultQueryBuilder(manager, id, 2).getCount(),
        await ResultQueryBuilder(manager, id, 4).getCount(),
        await ResultQueryBuilder(manager, id, 8).getCount(),
      ]

      /* GET 완료 응답 */
      ctx.response.status = 200
      ctx.body = {
        vote: MakeResponseVote(vote, selections, result),
      }
    })
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const GetAll = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { user } = ctx.state.token

  try {
    const votes: Vote[] = await conn
      .getRepository(Vote)
      .find({
        relations: [
          "polls",
          "polls.account",
          "polls.account.profile",
          "polls.account.student",
        ],
        order: {
          id: "DESC",
        }
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      votes: await Promise.all(votes.map(async vote => {
        const [selections, result] = await conn.manager.transaction(async manager => {
          const selections = []
          await SelectionQueryBuilder(manager, vote.id, user.id, 1).getCount() && selections.push(0)
          await SelectionQueryBuilder(manager, vote.id, user.id, 2).getCount() && selections.push(1)
          await SelectionQueryBuilder(manager, vote.id, user.id, 4).getCount() && selections.push(2)
          await SelectionQueryBuilder(manager, vote.id, user.id, 8).getCount() && selections.push(3)
          const result = [
            await ResultQueryBuilder(manager, vote.id, 1).getCount(),
            await ResultQueryBuilder(manager, vote.id, 2).getCount(),
            await ResultQueryBuilder(manager, vote.id, 4).getCount(),
            await ResultQueryBuilder(manager, vote.id, 8).getCount(),
          ]
          return [selections, result]
        })
        return MakeResponseVote(vote, selections, result)
      })),
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
      vote: MakeResponseVote(vote),
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
          "vote.polls",
          "vote.polls.account",
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
    
    if (polls.length === 0) {
      poll = new Poll()
      poll.vote = vote
      poll.account = account
    }
    else {
      poll = polls[0]
    }
    poll.selection = selection

    await conn.manager.save(poll)

    const result = await conn.manager.transaction(async manager => {
      return [
        await ResultQueryBuilder(manager, id, 1).getCount(),
        await ResultQueryBuilder(manager, id, 2).getCount(),
        await ResultQueryBuilder(manager, id, 4).getCount(),
        await ResultQueryBuilder(manager, id, 8).getCount(),
      ]
    })

    /* GET 완료 응답 */
    ctx.response.status = 201
    ctx.body = {
      poll,
      result: MakeResponseVoteResult(result, MakeResponseVoteItems(vote)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}