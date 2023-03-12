import http from 'node:http'

/*
  Creates a micro instance of the next callback based 
  middleware system similar to something like Koa 
*/
export function createApp() {
  const ctx = {}
  let middlewareChain = []
  let executed = []

  function use(...fn) {
    fn.forEach(x => {
      middlewareChain.push(x)
    })
  }

  function nextFn(i) {
    return async () => {
      if (executed.indexOf(i) > -1) return
      const toExec = middlewareChain[i]
      if (!toExec) {
        return
      }
      executed.push(i)
      const res = await toExec(ctx, nextFn(i + 1))
      return res
    }
  }

  async function handler(req, res) {
    ctx.request = req
    ctx.method = req.method
    ctx.path = req.url
    ctx.response = res

    Object.defineProperty(ctx, 'status', {
      configurable: true,
      get() {
        return res.statusCode
      },
      set(v) {
        res.statusCode = v
      },
    })

    executed = []
    ctx.end = () => {
      res.end()
    }
    ctx.set = obj => {
      Object.keys(obj).forEach(k => {
        res.setHeader(k, obj[k])
      })
    }
    try {
      let toExec = middlewareChain[0]
      await toExec(ctx, nextFn(1))
    } catch (err) {
      res.status = 500
      console.error(err)
      res.end('Internal Server Error')
    }
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
