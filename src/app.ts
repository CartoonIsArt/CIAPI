import * as Koa from "koa"
import * as bodyParser from "koa-bodyparser"
import * as logger from "koa-logger"
import * as Serve from "koa-static"
import * as path from "path"
import "reflect-metadata"
import { Connection, createConnection } from "typeorm"
import { router } from "./route"

const app = new Koa()

/* DB와 연결을 맺고 Connection Pool을 생성함 */
// tslint:disable-next-line
createConnection().catch(e => console.log(e))

/* 메소드, 응답시간을 콘솔에 로깅 */
app.use(logger())

/* POST JSON인자를 파싱하여 ctx.request.body에 저장해주는 미들웨어 */
app.use(bodyParser())

/* 정적파일 서빙 */
if (process.env.NODE_ENV !== "production") {
  app.use(Serve(path.join("test-restful", "dist")))
}

/* 라우팅 */
app.use(router.routes())

/* 3000번 포트에서 서비스 시작 */
app.listen(3000)
