import * as Koa from "koa"
import * as bodyParser from "koa-bodyparser"
import * as logger from "koa-logger"
import * as Router from "koa-router"
import { Connection, createConnection } from "typeorm"
import { GetAllUsers, PostUsers } from "./controller"

const app = new Koa()
const router = new Router()

createConnection()

app.use(logger())
app.use(bodyParser())

router.get("/", (ctx) => {
  ctx.body = { m: "Hello, world!" }
  // tslint:disable-next-line
  console.log("Hello, console!")
})

router.get("/users", GetAllUsers)
router.post("/users", PostUsers)

app.use(router.routes())

app.listen(3000)
