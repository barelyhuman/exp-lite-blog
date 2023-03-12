import fs from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFile, serveTemplate } from './serve.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function allRouteHandler(ctx) {
  // return 404 and end the request
  // if the method is not GET
  if (ctx.method !== 'GET') {
    ctx.status = 404
    return
  }

  // Specifically handle the style.css
  // request since we want to specify
  // mime for just this for now
  if (ctx.path === '/style.css') {
    ctx.set({
      'Content-Type': 'text/css',
    })
    return serveFile('./static/style.css')
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
