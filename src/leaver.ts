import { Connection, getConnection } from "typeorm"
import Files from "./entities/files"
import Users from "./entities/users"

// 작동을 안합니다. 추후 수정해주세요.

const leaver = async (ctx, next) => {
  const conn: Connection = getConnection()
  const profile: Files = new Files()

  try{
    const leavedUser = await conn
    .getRepository(Users)
    .findOne(0)

    if (leavedUser){
      const user: Users = new Users()

      /* 탈퇴 회원 이미지 생성 */
      profile.id = 0
      profile.filename = "leaved.jpg"
      // profile.savedPath = "MIKI"
      profile.savedPath = "/images/MIKI.png"

      await conn.manager.save(profile)

      /* 탈퇴 회원 DB에 추가 */
      user.id = 0
      user.fullname = "탈퇴 회원"
      user.nTh = 0
      user.dateOfBirth = new Date()
      user.username = "asdf"
      user.password = "asdf"
      user.department = "leaved"
      user.studentNumber = 0
      user.email = "leaved"
      user.phoneNumber = "leaved"

      /* relation 형성 */
      profile.user = user

      await conn.manager.save(user)
    }
  }
  catch (e){
    await conn.manager.remove(profile)
    ctx.throw(400, e)
  }

  await next()
}

export default leaver
