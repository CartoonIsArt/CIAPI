import * as jpeg from 'jpeg-js'
import * as tf from '@tensorflow/tfjs-node'
import * as nsfw from 'nsfwjs'

// https://github.com/infinitered/nsfwjs
let model

const convert = async (img) => {
  // Decoded image in UInt8 Byte array
  const image = await jpeg.decode(img, { useTArray: true })

  const numChannels = 3
  const numPixels = image.width * image.height
  const values = new Int32Array(numPixels * numChannels)

  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c]

  return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
}

// https://engineering.linecorp.com/ko/blog/typescript-enum-tree-shaking/
const IS_NSFW = {
  HENTAI: 'Hentai',
  PORN: 'Porn',
  SEXY: 'Sexy',
} as const
type IS_NSFW = typeof IS_NSFW[keyof typeof IS_NSFW]

const reducer = (accumulator, value) => {
  switch (value.className) {
    case IS_NSFW.HENTAI:  // fall-through
    case IS_NSFW.PORN:
    case IS_NSFW.SEXY:
      return accumulator + value.probability
    default:
      return accumulator
  }
}

export const loadModel = async () => {
  model = await nsfw.load()
}

export const isSafe = async (buffer) => {
  const image = await convert(buffer)
  const predictions = await model.classify(image)
  image.dispose()
  return (predictions.reduce(reducer, 0) < 0.4)
}