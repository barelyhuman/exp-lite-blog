import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const cmsPath = join(__dirname, '..', '.cms')

async function init() {
  await mkdir(cmsPath, { recursive: true })
  await __initAdminFile()
}

async function __initAdminFile() {
  await writeFile(join(cmsPath, 'admins.txt'), '', 'utf8')
}

async function createAdminUser(email, password) {
  const admins = await getAdminUsers()
  admins.push({
    email,
    passwordHash: password,
  })

  const asString = admins
    .map(cred => {
      return `${cred.email}\t${cred.passwordHash}`
    })
    .join('\n')

  await writeFile(join(cmsPath, 'admins.txt'), asString, 'utf8')
}

async function getAdminUsers() {
  const d = await readFile(join(cmsPath, 'admins.txt'), 'utf8')
  return d
    .split('\n')
    .map(x => {
      const [email, passwordHash] = x.split('\t')
      if (!(email && passwordHash)) return false
      return {
        email,
        passwordHash,
      }
    })
    .filter(x => x)
}

function loginUser() {}

export const cms = {
  init,
  getAdminUsers,
  createAdminUser,
}
