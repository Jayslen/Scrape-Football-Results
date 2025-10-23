import fs from 'node:fs/promises'
import path, { parse } from 'node:path'

const { root } = parse(process.cwd())

const matchesDir = path.join(
  root,
  'football-stats',
  'matches',
  'premier-league',
  '2024-2025'
)

const matchesFiles = await fs.readdir(matchesDir)

const keys = new Set<string>()

for (const file of matchesFiles) {
  const filePath = path.join(matchesDir, file)
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const jsonContent = JSON.parse(fileContent)

  jsonContent.matches.forEach((match: any) => {
    match.playersStats.forEach((playerStat: any) => {
      Object.entries(playerStat.stats).forEach(([key, val]) => {
        keys.add(`${key}:::${typeof val}`)
      })
    })
  })
}

const dataFormated = Array.from(keys).map((item) => {
  const [key, type] = item.split(':::')
  return { key, type }
})

await fs.writeFile(
  path.join(root, 'football-stats', 'matchesKeys.json'),
  JSON.stringify(dataFormated, null, 2),
  'utf-8'
)

console.log(dataFormated)
