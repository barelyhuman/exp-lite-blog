import qs from 'querystring'

export const bodyParser = async (ctx, next) => {
  let chunks = ''

  return new Promise((resolve, reject) => {
    ctx.request.on('data', chunk => {
      chunks += chunk
    })

    ctx.request.on('end', () => {
      const data = qs.parse(chunks)
      ctx.body = data
      resolve(next())
    })
  })
}
