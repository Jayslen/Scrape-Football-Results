import fs from 'node:fs/promises'
import { FilesParser } from './parseFiles.js'
import PreloadDBData from './preload.js'

export async function parseGoalsValues() {
  const matches = await FilesParser.MatchesFiles()
  const matchesDetailes = matches.flatMap((match) =>
    match.matches.map((m) => {
      const [competition, season] = match.league.split(/\s(?=[^ ]*$)/)
      return {
        matchWeek: match.matchWeek,
        teams: m.teams,
        competition: competition,
        season: season.replace('/', '-'),
        goals: m.goals
      }
    })
  )

  const playersMapDb = await PreloadDBData.players(true)
  const matchesMap = await PreloadDBData.matches()
  const teamsMap = await PreloadDBData.teams()

  const goalsValues: (string | number)[][] = []

  for (const match of matchesDetailes) {
    const matchKey =
      `${match.teams[0]} vs ${match.teams[1]} - ${match.competition} - ${match.season} - Week ${match.matchWeek}`
        .toLowerCase()
        .replaceAll(' ', '')
    const matchId = matchesMap.get(matchKey)
    for (let teamIndex = 0; teamIndex < match.goals.length; teamIndex++) {
      const teamGoals = match.goals[teamIndex]
      if (teamGoals.length === 0) continue
      const teamId = teamsMap.get(match.teams[teamIndex])
      for (const goal of teamGoals) {
        const playerId = playersMapDb.get(goal.scorer)
        for (const minute of goal.minute) {
          const [goalMinute, goalType] = minute
            .replaceAll(/\s/g, '')
            .replaceAll("'", ' ')
            .split(' ')
          const [finalMinute, extraTime] = goalMinute.includes('+')
            ? goalMinute.split('+')
            : [goalMinute, null]

          goalsValues.push([
            `UUID_TO_BIN('${matchId}', 1)`,
            `UUID_TO_BIN('${playerId}', 1)`,
            `UUID_TO_BIN('${teamId}', 1)`,
            parseInt(finalMinute),
            extraTime ? parseInt(extraTime) : 'NULL',
            goalType === '(Pen)' ? 1 : 'NULL',
            goalType === '(OG)' ? 1 : 'NULL'
          ])
        }
      }
    }
  }
  await fs.writeFile(
    './debug-file/goalsValues.json',
    JSON.stringify(goalsValues, null, 2)
  )
  return goalsValues
}
