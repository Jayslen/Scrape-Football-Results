import path from 'node:path'
import fs from 'node:fs/promises'
import { MatchDetails, Teams } from '@customTypes/global'

export async function writeData(filePaths: { data: MatchDetails | Teams, dir: string, fileName: string }) {
  const { data, dir, fileName } = filePaths
  const { root } = path.parse(process.cwd())

  const route = path.join(root, 'football-stats', dir)

  await fs.mkdir(route, { recursive: true })

  await fs.writeFile((route + fileName), JSON.stringify(data))

  const savedFilePath = path.join(route, fileName)
  console.log('Date saved in:', savedFilePath)
}
