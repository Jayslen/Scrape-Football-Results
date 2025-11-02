import { randomUUID } from 'node:crypto'
import { FilesParser } from './parseFiles.js'
import PreloadDBData from './preload.js'

export async function parseMatchesFiles() {
  const matchesValues: string[][] = []
  const matchesData = await FilesParser.MatchesFiles()

  const teamsDbMap = await PreloadDBData.teams(true)
  const stadiumsDbMap = await PreloadDBData.stadiums(true)
  const competitionsDbMap = await PreloadDBData.competitions()
  const seasonsDbMap = await PreloadDBData.seasons()

  for (let i = 0; i < matchesData.length; i++) {
    const { league, matchWeek, matches } = matchesData[i]
    for (const match of matches) {
      const {
        teams,
        details: { attendance, stadium, referee, date }
      } = match
      const [leagueName, leagueSeason] = league.split(/\s(?=[^ ]*$)/)
      matchesValues.push([
        `UUID_TO_BIN('${randomUUID()}', 1)`,
        `UUID_TO_BIN('${teamsDbMap.get(teams[0])}', 1)`,
        `UUID_TO_BIN('${teamsDbMap.get(teams[1])}', 1)`,
        `${attendance ? parseInt(attendance.replace(',', '')) : 'NULL'}`,
        `UUID_TO_BIN('${seasonsDbMap.get(leagueSeason.replace('/', '-'))}', 1)`,
        `UUID_TO_BIN('${competitionsDbMap.get(
          leagueName.replace(' ', '').toLowerCase()
        )}', 1)`,
        `${parseInt(matchWeek)}`,
        `STR_TO_DATE('${new Date(date).toDateString()}', '%a %b %d %Y')`,
        `UUID_TO_BIN('${stadiumsDbMap.get(stadium)}', 1)`,
        `${referee}`
      ])
    }
  }
  return matchesValues
}
