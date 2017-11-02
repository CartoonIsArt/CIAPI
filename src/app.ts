import * as Koa from "koa"
import * as bodyParser from "koa-bodyparser"
import * as logger from "koa-logger"
import "reflect-metadata"
import { Connection, createConnection } from "typeorm"
import { router } from "./route"

const app = new Koa()

createConnection().catch(e => console.log(e))

app.use(logger())
app.use(bodyParser())
app.use(router.routes())

app.listen(3000)
