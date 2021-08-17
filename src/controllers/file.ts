import Axios from 'axios'
import * as FormData from 'form-data'
import * as https from 'https'
import { isSafe } from '../lib/nsfw'

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
  try {
    if (!await isSafe(ctx.file.buffer))
      throw new Error('야한 건 안된다고 생각해요!')
  }
  catch (e) {
    ctx.throw(400, e)
  }

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
  const safes = []
  const unsafes = []
  const formData = new FormData()
  
  const r = await Promise.all(ctx.files.map(photo => isSafe(photo.buffer)))
  r.forEach((isSafe, idx) => {
    isSafe
      ? safes.push(ctx.files[idx])
      : unsafes.push(ctx.files[idx].originalname)
  })
  safes.forEach(photo => formData.append('photo', photo.buffer, photo.originalname))

  const config = {
    baseURL: `https://${ctx.request.hostname}`,
    headers: formData.getHeaders(),
  }

  try {
    if (unsafes.length === ctx.files.length)
      throw new Error('야한 건 안된다고 생각해요!')

    const r = await axios.post('/images/upload-multiple', formData, config)

    /* POST 완료 응답 */
    ctx.response.status = 201
    if (unsafes.length > 0)
      ctx.body = {
        ...r.data,
        warning: '야한 건 안된다고 생각해요!',
        unsafes,
      }
    else
      ctx.body = r.data
  }
  catch (e) {
    ctx.throw(400, e)
  }
}
