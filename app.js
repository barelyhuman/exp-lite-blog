import * as markdown from 'marked'
import fs from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { allRouteHandler } from './lib/handlers.js'
import { createApp } from './lib/http-middleware.js'
import { responder } from './lib/responder.js'

export const app = createApp()

const indexMeta = []

const __dirname = dirname(fileURLToPath(import.meta.url))

const contentDir = join(__dirname, 'content')
for (let file of [...(await fs.readdir(contentDir))]) {
  const fileData = await fs.readFile(join(contentDir, file), 'utf-8')
  const matched = fileData.match(/^#{1} (\w+.+)$/m)
  const slug = file.replace('.md', '.html')
  let heading = 'Untitled'

  const frontmatter = {}
  let content = fileData
  const fnSplit = fileData.split('---')

  if (fnSplit.length === 3) {
    fnSplit[1].split('\n').forEach(ln => {
      const [k, v] = ln.split(':')
      if (k) {
        frontmatter[k] = v.trim()
      }
    })
    content = fnSplit[2]
  }

  if (matched) {
    heading = matched[1]
  }

  indexMeta.push({
    slug: slug,
    heading,
    front: frontmatter,
    content: markdown.parse(content),
  })
}

indexMeta.sort((x, y) => {
  if (y.front.date && x.front.date) {
    return new Date(y.front.date).getTime() - new Date(x.front.date).getTime()
  }
  return 0
})

app.context.indexMeta = indexMeta

app.use(responder)

app.use(allRouteHandler)
