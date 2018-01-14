import { Connection, getConnection, getManager } from "typeorm"
import Files from "../entities/files"
import Users from "../entities/users"

/* 유저 테이블의 모든 값을 리턴함. */
export const Get = async (ctx, next) => {
  const conn: Connection = getConnection()
  ctx.body = await conn
    .getRepository(Users)
    .find({ relations: ["profileImage"] })
}

/* fullname을 POST 인자로 받아 DB에 저장함. */
export const Post = async (ctx, next) => {
  /* POST 인자를 data변수로 받음 */
  const data = ctx.request.body

    /* DB 커넥션풀에서 커넥션을 하나 가져옴. */
  const conn: Connection = getConnection()

    /* Users 테이블 ORM 인스턴스 생성 */
  const user: Users = new Users()
  user.fullname = data.fullname

    /*프로필 이미지를 DB에 포함 및 relation을 구성 */
  const profile: Files = new Files()
  profile.file = data.profileImage
  profile.savedPath = "MIKI"
  try{
    await conn.manager.save(profile)
  }
  catch (e){
    ctx.throw(400, e)
  }
  user.username = data.username
  user.profileImage = profile
  user.dateOfBirth = data.dateOfBirth
  user.department = data.department
  user.studentNumber = data.studentNumber
  user.nTh = data.nTh
  user.profileText = data.profileText
  user.phoneNumber = data.phoneNumber
  user.favoriteComic = data.favoriteComic
  user.favoriteCharacter = data.favoriteCharacter
  user.password = data.password

  /* id를 포함하여 body에 응답 */
  ctx.body = user

  try {
    /* DB에 저장 - 비동기 */
    await conn.manager.save(profile)
  }
  catch (e){
    ctx.throw(400, e)
  }

  try {
    /* DB에 저장 - 비동기 */
    await conn.manager.save(user)
  }
  catch (e) {
    /* required member중 하나라도 인자에 없을 경우 400에러 리턴 - 수정*/
    ctx.throw(400, e)
  }
}
export const Delete =  async (ctx, next) => {
  const conn: Connection = getConnection()

  try {
    const user = await conn
                      .getRepository(Users)
                      .findOneById(ctx.params.id)
    await conn.manager.remove(user)
    ctx.response.status = 204
  }
  catch (e) {
    ctx.throw(400, e)
  }

}
