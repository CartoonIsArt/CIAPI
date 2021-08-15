import Axios from 'axios'
import * as FormData from 'form-data'
import * as https from 'https'

const axios = Axios.create({
  withCredentials: true,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
})

/* 해당 파일 GET */
export const GetOne = async (ctx, next) => {
  const config = {
    baseURL: `https://${ctx.request.hostname}`,
  }
  try {
    const r = await axios.get(ctx.request.originalUrl, config)
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
  const formData = new FormData()
  formData.append('avatar', ctx.file.buffer, ctx.file.originalname)

  const config = {
    baseURL: `https://${ctx.request.hostname}`,
    headers: formData.getHeaders(),
  }

  try {
    const r = await axios.post('/images/upload-single', formData, config)
    
    /* POST 완료 응답 */
    ctx.response.status = 201
    ctx.body = r.data
  }
  catch (e) {
    ctx.throw(400, e)
  }
}

export const PostAll = async (ctx) => {
  const formData = new FormData()
  ctx.files.forEach(photo => formData.append('photo', photo.buffer, photo.originalname))
  
  const config = {
    baseURL: `https://${ctx.request.hostname}`,
    headers: formData.getHeaders(),
  }

  try {
    const r = await axios.post('/images/upload-single', formData, config)
    
    /* POST 완료 응답 */
    ctx.response.status = 201
    ctx.body = r.data
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
