import { Stream } from 'node:stream'

/**
 * Middleware for the micro middleware instance
 * to automatically write to the response
 * if the invoked last function returns data
 * or stream
 */
export async function responder(ctx, next) {
  try {
    const response = await next()

    if (!response) {
      ctx.response.end()
      return
    }

    if (response instanceof Stream) {
      response.pipe(ctx.response)
    } else {
      ctx.response.write(response)
      ctx.response.end()
    }
  } catch (err) {
    ctx.status = 500
    ctx.response.write('Oops! Something went wrong')
    ctx.response.end()
    console.error(err)
  }
}
