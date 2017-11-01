import * as Koa from "koa"
import * as logger from "koa-logger"
import * as Router from "koa-router"

const app = new Koa()
const router = new Router()

app.use(logger())

router.get("/", (ctx) => {
  ctx.body = {m: "Hello, world!"}
  // tslint:disable-next-line
  console.log("Hello, console!")
})

app.use(router.routes())

app.listen(3000)
