import * as Router from "koa-router"
import * as Users from "./controllers/users"

export const router = new Router()

/* 접속 상태 확인 테스트 경로 - 변경예정 */
router.get("/", (ctx) => {
  /* body에 Object를 그냥 줘도 JSON string으로 변환해줌! */
  ctx.body = { m: "Hello, world!" }
})

/* router 등록방법: router.메소드("경로", 함수)

   메소드: get, post, put, delete, option 등등

   함수: (ctx, next)를 인자로 받는 함수.
   ctx: 현재 컨텍스트. 리퀘스트 1개당 컨텍스트 1개가 생성됨.
        리퀘스트 + 리스폰스 = 컨텍스트 인 것 같음.
   next: 잘 모르겠음ㅎ 아마 다른 미들웨어가 실행된 후에 추가로
         실행하고 싶은 소스가 있을 경우 사용하는 것 같음.
         async (ctx, next) => {
           // 원래 이 미들웨어 순서에 맞게 실행
           await next()
           // 다른 미들웨어 실행 후 실행
         }

*/
router.get("/users", Users.Get)
router.post("/users", Users.Post)