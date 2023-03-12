import http from 'node:http'

/*
  Creates a micro instance of the next callback based 
  middleware system similar to something like Koa 
*/
export function createApp() {
  const ctx = {}
  let middlewareChain = []

  function use(...fn) {
    middlewareChain = middlewareChain.concat(fn)
  }

  function nextFn(i) {
    return async () => {
      const toExec = middlewareChain[i + 1]
      const res = await toExec(ctx, nextFn(i + 2))
      return res
    }
  }

  function handler(req, res) {
    ctx.request = req
    ctx.method = req.method
    ctx.path = req.url
    ctx.response = res
    ctx.set = obj => {
      Object.keys(obj).forEach(k => {
        res.setHeader(k, obj[k])
      })
    }
    let toExec = middlewareChain[0]
    toExec(ctx, nextFn(0))
  }

  function listen(port, cb) {
    return http.createServer(handler).listen(port, cb)
  }

  return {
    context: ctx,
    use,
    handler,
    listen,
  }
}
