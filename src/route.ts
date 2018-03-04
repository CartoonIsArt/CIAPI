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

/*  응답코드 : 메소드가 제데로 작동 되었을 때에 따른 출력되는 코드
              
  200 : OK (get, post, delete 등 작업이 완료되었을 때 출력)
  201 : Created (주로 put 에 쓰이며 작업으로 인해 정보가 추가되었을 때 출력)
        CIAPI 에서는 put 이 아닌 post 로 정보를 추가하기 때문에, 정보가 추가되는 곳에는 201 로 설정함.
  204 : No Content (작업을 진행해도 아무런 정보가 뜨지 않는 경우)
  
  출처 : https://developer.mozilla.org/ko/docs/Web/HTTP/Status
*/

router.post("/login", Sessions.Login)
router.post("/logout", Sessions.Logout)

router.get("/users/:id", Users.Get)
router.post("/users", Users.Post)
router.delete("/users/:id", Users.Delete)

router.get("/users/:id/documents", Users.GetDocuments)
router.get("/users/:id/comments", Users.GetComments)

router.get("/comments/:id", Comments.Get)
router.post("/comments", Comments.Post)
router.delete("/comments/:id", Comments.Delete)

router.get("/comments/:id/likedBy", Comments.GetLikedBy)
router.post("/comments/:id/likedBy", Comments.LikedBy)
router.delete("/comments/:id/likedBy", Comments.UnlikedBy)

router.get("/documents/:id", Documents.Get)
router.post("/documents", Documents.Post)
router.delete("/documents/:id", Documents.Delete)

router.get("/documents/:id/likedBy", Documents.GetLikedBy)
router.post("/documents/:id/likedBy", Documents.LikedBy)
router.delete("/documents/:id/likedBy", Documents.UnlikedBy)

router.get("/files", Files.Get)
router.post("/files", Files.Post)
router.delete("/files/:id", Files.Delete)

router.post("/cia", Cia.Post)
router.patch("/cia/:name", Cia.Patch)
