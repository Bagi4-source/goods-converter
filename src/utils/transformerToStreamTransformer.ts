import { Transform } from 'stream'

export function transformerToStreamTransformer (fun: (...args: any) => any): Transform {
  return new Transform({
    transform (chunk, encoding, callback) {
      callback(null, fun(chunk))
    }
  })
}
