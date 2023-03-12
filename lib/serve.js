import fs from 'node:fs'
import { Readable } from 'node:stream'

export function serveFile(path) {
  return fs.createReadStream(path)
}

export function serveTemplate(path, replacement) {
  const str = fs.createReadStream(path, 'utf8')
  const templateStream = new Readable()

  templateStream._read = () => {}

  str.on('data', data => {
    let _data = data
    _data = data.replace('<!--template-data-->', replacement)
    templateStream.push(_data)
  })

  str.on('end', () => {
    templateStream.push(null)
  })

  return templateStream
}
