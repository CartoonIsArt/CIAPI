import * as Router from "koa-router"
import * as Users from "./controllers/users"

export const router = new Router()

router.get("/", (ctx) => {
  ctx.body = { m: "Hello, world!" }
  // tslint:disable-next-line
  console.log("Hello, console!")
})

router.get("/users", Users.Get)
router.post("/users", Users.Post)
