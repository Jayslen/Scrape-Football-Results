import path from 'node:path'
import fs from 'node:fs/promises'

export async function writeMatchesData ({ data }) {
  const { root } = path.parse(process.cwd())

  const dir = data.league.replaceAll(' ', '-')
  const leagueRound = data.matchWeek
  const route = path.join(root, dir)

  const fileName = `/${leagueRound.replaceAll(' ', '-')}.json`

  await fs.mkdir(route, { recursive: true })

  await fs.writeFile((route + fileName), JSON.stringify(data))

  const savedFilePath = path.join(root, dir, fileName)
  console.log('Date saved in:', savedFilePath)
}
