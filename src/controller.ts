import { getManager, getRepository } from "typeorm"
import * as Models from "./models"

export const GetAllUsers = async (ctx, next) => {
  const entityManager = getManager()
  ctx.body = await entityManager.find(Models.User)
}

export const PostUsers = async (ctx, next) => {
  const data = ctx.request.body
  if (data.firstname !== undefined) {
    const userRepo = getRepository(Models.User)
    const user: Models.User = new Models.User()
    user.firstname = data.firstname

    await userRepo.save(user)
    ctx.body = user
  }
  else {
    ctx.throw(400, "firstname required")
  }
}
