import path from 'node:path'
import fs from 'node:fs/promises'

export async function writeData ({ data, dir, fileName }) {
  const { root } = path.parse(process.cwd())

  const route = path.join(root, dir)

  await fs.mkdir(route, { recursive: true })

  await fs.writeFile((route + fileName), JSON.stringify(data))

  const savedFilePath = path.join(root, dir, fileName)
  console.log('Date saved in:', savedFilePath)
}
