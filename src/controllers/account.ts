import * as crypto from "crypto"
import { Connection, getConnection } from "typeorm"
import { Authenticate } from "../auth"
import Account, { MakeResponseAccount } from "../entities/account"
import Comment from "../entities/comment"
import Document from "../entities/document"
import Profile from "../entities/profile"
import Student from "../entities/student"

/* 인증된 계정 GET */
export const GetAuthenticated = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { user } = ctx.state.token
  
  try {
    const account: Account = await conn
      .getRepository(Account)
      .findOne(user.id, {
        relations: ["profile", "student"],
      })
    
    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      account: MakeResponseAccount(account),
    }
  }
  catch (e) {
    ctx.throw(401, e)
  }
}

/* 해당 계정 GET */
export const GetOne = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params

  try {
    const account: Account = await conn
      .getRepository(Account)
      .findOne(id, {
        relations: ["profile", "student"],
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      account: MakeResponseAccount(account),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 모든 계정 GET */
export const GetAll = async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const accounts: Account[] = await conn
      .getRepository(Account)
      .find({
        relations: ["profile", "student"],
      })

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      accounts: accounts.map(account => MakeResponseAccount(account)),
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 계정 POST */
export const Post = async (ctx, next) => {
  const conn: Connection = getConnection()
  const data = ctx.request.body

  /* 계정 정보 생성 */
  const account: Account = new Account()
  account.username = data.username

  const salt: Buffer = crypto.randomBytes(64)
  account.salt = salt.toString('hex')

  const derivedKey: Buffer = crypto.pbkdf2Sync(data.password, account.salt, 131071, 64, 'sha512')
  account.password = derivedKey.toString('hex')

  /* 프로필 정보 생성 */
  const profile: Profile = new Profile()
  profile.favoriteComic = data.favoriteComic
  profile.favoriteCharacter = data.favoriteCharacter
  profile.profileText = data.profileText

  if (data.profileImage)
    profile.profileImage = `/images/${data.profileImage}`

  /* 학생 정보 생성 */
  const student: Student = new Student()
  student.studentNumber = data.studentNumber
  student.name = data.name
  student.nTh = data.nTh
  student.birthdate = data.birthdate
  student.major = data.major
  student.email = data.email
  student.phoneNumber = data.phoneNumber

  account.profile = profile
  account.student = student

  try {
    /* 데이터 저장 */
    await conn.manager.save([account, student, profile])

    /* POST 완료 응답 */
    ctx.response.status = 201
    ctx.body = {
      account: MakeResponseAccount(account),
    }
  }
  catch (e) {
    if (e.errno === 1062) // ER_DUP_ENTRY
      ctx.throw(400, { message: e.sqlMessage })
    else
      ctx.throw(400, e)
  }
}

/* 해당 계정 DELETE */
export const DeleteOne =  async (ctx, next) => {
  const conn: Connection = getConnection()
  const leaver: Account = await conn.getRepository(Account).findOne(0)
  const { id } = ctx.params

  if (id === 0) {
    ctx.throw(400, { message: "삭제할 수 없는 계정입니다." })
  }

  try {
    const account: Account = await conn
      .getRepository(Account)
      .findOne(id, {
        relations: ["profile", "student"],
      })

    /* 해당 계정 정보를 탈퇴한 계정 정보로 덮어쓰기 */
    await conn.manager.transaction(async manager => {
      await manager.update(Account, account, leaver)
      await manager.update(Profile, account.profile, leaver.profile)
      await manager.update(Student, account.student, leaver.student)
    })
    
    /* DELETE 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 계정 게시글 GET */
export const GetDocuments = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params

  try {
    const documents: Document[] = await conn
      .getRepository(Document)
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.author", "author")
      .where("author.id = :id", { id })
      .getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      documents,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 계정 댓글 GET */
export const GetComment = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params

  try {
    const comment: Comment[] = await conn
      .getRepository(Comment)
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.author", "author")
      .where("author.id = :id", { id })
      .getMany()

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      comment,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 해당 계정 PATCH */
export const PatchOne = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { id } = ctx.params
  const { profile, student } = ctx.request.body

  if (!profile.profileImage.startsWith('/images/'))
    profile.profileImage = `/images/${profile.profileImage}`

  if (!profile.profileBannerImage.startsWith('/images/'))
    profile.profileBannerImage = `/images/${profile.profileBannerImage}`

  try {
    const account: Account = await conn
      .getRepository(Account)
      .findOne(id, {
        relations: ["profile", "student"],
      })

    /* 계정 정보 업데이트 */
    await conn.manager.transaction(async manager => {
      await manager.update(Profile, account.profile, profile)
      await manager.update(Student, account.student, student)
    })
    // profile.account = student.account = account
    // await conn.manager.save([profile, student])

    account.profile = profile
    account.student = student
    
    /* PATCH 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 모든 계정 PATCH (활동인구 여부 수정) */
export const PatchAll = async (ctx, next) => {
  const conn: Connection = getConnection()
  const { actives, inactives }: { actives: number[], inactives: number[] } = ctx.request.body

  try {
    await conn.manager.transaction(async manager => {
      actives.length && await manager.update(Account, actives, { isActive: true })
      inactives.length && await manager.update(Account, inactives, { isActive: false })
    })

    /* PATCH 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      actives,
      inactives,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const CheckPassword = async (ctx, next) => {
  const { user } = ctx.state.token
  const data = ctx.request.body

  try {
    await Authenticate(user.username, data.password)

    /* 완료 응답 */
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
