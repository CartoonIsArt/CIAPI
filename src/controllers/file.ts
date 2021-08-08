import axios from 'axios'

/* 해당 파일 GET */
export const GetOne = async (ctx, next) => {
  try {
    const r = await axios.get(ctx.request.originalUrl)
    const { file } = r.data

    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      file,
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 모든 파일 GET */
export const GetAll = async (ctx, next) => {
  try {
    /* GET 완료 응답 */
    ctx.response.status = 200
    ctx.body = {
      files: ctx.files
    }
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

/* 파일 POST */
export const PostOne = async (ctx) => {
  try {
    await axios.post(ctx.request.originalUrl, ctx.request.body)
  }
  catch (e) {
    ctx.throw(400, e)
  }

  /* POST 완료 응답 */
  ctx.response.status = 200
  ctx.body = {
    avatar: ctx.file.filename,
  }
}

export const PostAll = async (ctx) => {
  try {
    await axios.post(ctx.request.originalUrl, ctx.request.body)
  }
  catch (e) {
    ctx.throw(400, e)
  }
  
  /* POST 완료 응답 */
  ctx.response.status = 200
  ctx.body = {
    photos: ctx.files.map(file => file.filename),
  }
}
