import * as Router from "koa-router"
import * as Cia from "./controllers/cia"
import * as Comments from "./controllers/comments"
import * as Documents from "./controllers/documents"
import * as Files from "./controllers/files"
import * as Sessions from "./controllers/sessions"
import * as Users from "./controllers/users"

export const router = new Router()

/* router 등록방법: router.메소드("경로", 함수)

   메소드: get, post, put, delete, option 등등

   함수: (ctx, next)를 인자로 받는 함수.
   ctx: 현재 컨텍스트. 리퀘스트 1개당 컨텍스트 1개가 생성됨.
        리퀘스트 + 리스폰스 = 컨텍스트.
   next: 다른 미들웨어가 실행될 때 까지 현재 미들웨어가 기다림.
         실행하고 싶은 다른 미들웨어가 있을 경우 사용.
         async (ctx, next) => {
           // app.use에 등록한 순서대로 실행
           await next()
           // 역순으로 실행
         }

*/
router.post("/login", Sessions.Login)
router.post("/logout", Sessions.Logout)

router.get("/users", Users.Get)
router.post("/users", Users.Post)
router.delete("/users/:id", Users.Delete)

router.get("/comments/:id", Comments.Get)
router.post("/comments", Comments.Post)
router.delete("/comments/:id", Comments.Delete)

router.get("/documents", Documents.Get)
router.post("/documents", Documents.Post)
router.delete("/documents/:id", Documents.Delete)
router.post("/documents/:id/likedBy", Documents.LikedBy)
router.delete("/documents/:id/likedBy", Documents.UnlikedBy)

router.get("/files", Files.Get)
router.post("/files", Files.Post)
router.delete("/files/:id", Files.Delete)

router.post("/cia", Cia.Post)
router.patch("/cia/:name", Cia.Patch)
