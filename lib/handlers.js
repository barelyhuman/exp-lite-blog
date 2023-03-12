import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cms } from './cms.js'
import { serveFile, serveTemplate } from './serve.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function blogRouteHandler(ctx) {
  // return 404 and end the request
  // if the method is not GET
  if (ctx.method !== 'GET') {
    ctx.status = 404
    return
  }

  let filePath = ctx.path.replace('.html', '') + '.md'
  try {
    // Check if the file exists in the indexMeta
    const contentFile = join(__dirname, '..', 'content', filePath)
    let matchedIndex = ctx.indexMeta.findIndex(
      x => x.slug === basename(contentFile).replace('.md', '.html')
    )

    ctx.set({
      'Content-Type': 'text/html',
    })

    if (matchedIndex === -1) {
      if (ctx.path !== '/') {
        return serveFile('./templates/404.html')
      }
      matchedIndex = 0
    }

    return serveTemplate(
      './templates/index.html',
      `<article>${ctx.indexMeta[matchedIndex].content}</article>
        <hr>
        <section>
          <h3>Other Posts</h3>
          <ul class="posts">
            ${ctx.indexMeta
              .map(
                (x, index) =>
                  `<li class="post-item">
                  <a href="/${x.slug.replace('.html', '')}"> ${
                    index == matchedIndex ? `<em>${x.heading}</em>` : x.heading
                  } </a>
            </li>`
              )
              .join('\n')}
          </ul>
        </section> `
    )
  } catch (err) {
    // digest
  }

  ctx.status = 404
  return
}

export async function loginHandler(ctx, next) {
  if (ctx.path !== '/login') {
    return await next()
  }

  const users = await cms.getAdminUsers()

  if (users.length === 0) {
    ctx.status = 303
    ctx.set({
      Location: '/admin/register',
    })
    ctx.end()
    return
  }

  if (ctx.method === 'GET') {
    return serveFile(join(__dirname, '../templates/login.html'))
  }

  if (ctx.method === 'POST') {
    const hasUser = users.find(x => x.email === ctx.body.email)
    if (hasUser && hasUser.passwordHash === ctx.body.password) {
      ctx.status = 303
      ctx.set({
        Location: '/app',
      })
      ctx.end()
      return
    }
  }
}

export async function registerAdmin(ctx, next) {
  if (ctx.path !== '/admin/register') {
    return await next()
  }

  if (ctx.method === 'GET') {
    return serveFile(join(__dirname, '../templates/register-admin.html'))
  }

  if (ctx.method === 'POST') {
    await cms.createAdminUser(ctx.body.email, ctx.body.password)
    ctx.status = 303
    ctx.set({
      Location: '/login',
    })
    return ctx.end()
  }
}

export async function staticHandler(ctx, next) {
  // Specifically handle the style.css
  // request since we want to specify
  // mime for just this for now
  if (ctx.path !== '/style.css') {
    return await next()
  }
  ctx.set({
    'Content-Type': 'text/css',
  })
  return serveFile(join(__dirname, '../static/style.css'))
}

export async function appHandler(ctx, next) {
  if (ctx.path !== '/app') {
    return next()
  }

  return serveTemplate(
    join(__dirname, '../templates/app.html'),
    `<section></section>`
  )
}
