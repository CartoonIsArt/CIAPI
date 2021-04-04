import * as Router from "koa-router"
import * as Comment from "../controllers/comment"
import * as Document from "../controllers/document"
import * as File from "../controllers/file"
import * as AuthenticationToken from "../controllers/authenticationToken"
import * as Timeline from "../controllers/timeline"
import * as User from "../controllers/user"

export var router = new Router({ prefix: '/api' })
// export var router = new Router()

// if (process.env.NODE_ENV === 'production') {
//   router = new Router({
//     prefix: '/api'
//   })
// }

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

// public API
router.post("/public/login", AuthenticationToken.Login)
router.post("/public/user", User.Post)

// authorization required API
router.get("/user/authenticated", User.GetAuthenticated)
router.get("/user/:id", User.GetOne)
router.get("/user", User.GetAll)
router.delete("/user/:id", User.DeleteOne)
router.patch("/user/:id", User.PatchOne)
router.patch("/user", User.PatchAll)
router.get("/user/:id/document", User.GetDocuments)
router.get("/user/:id/comment", User.GetComment)

router.get("/timeline", Timeline.GetTimeline)
router.get("/timeline/:username", Timeline.GetUserTimeline)
router.get("/timeline/:username/likes", Timeline.GetLikedTimeline)
router.get("/timeline/:username/comments", Timeline.GetCommentedTimeline)

router.get("/document/:id", Document.GetOne)
router.post("/document", Document.Post)
router.patch("/document", Document.PatchOne)
router.get("/document/:id/likeIt", Document.GetLikes)
router.post("/document/:id/likeIt", Document.PostLikes)
router.delete("/document/:id/likeIt", Document.CancelLikes)

router.get("/comment/:id", Comment.GetOne)
router.post("/comment", Comment.Post)
router.get("/comment/:id/likeIt", Comment.GetLikes)
router.post("/comment/:id/likeIt", Comment.PostLikes)
router.delete("/comment/:id/likeIt", Comment.CalcelLikes)

router.get("/file/:id", File.GetOne)
router.get("/file", File.GetAll)
router.post("/file", File.Post)
router.delete("/file/:id", File.DeleteOne)

router.get("/logout", AuthenticationToken.Logout)
