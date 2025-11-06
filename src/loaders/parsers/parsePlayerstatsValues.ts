import { FilesParser } from './parseFiles.js'
import { InsertionConfig } from '../../commands/teams-insertion/InsertionConfig.js'
import { randomUUID } from 'crypto'
import PreloadDBData from '../../utils/preload.js'

const statsOrder = InsertionConfig.playersStats.columns
export async function parsePlayerstatsValues() {
  const matchesValues = await FilesParser.MatchesFiles()
  const matchesMapDb = await PreloadDBData.matches(true)
  const playersMapDb = await PreloadDBData.players(true)

  const playersStats = matchesValues
    .flatMap((m) =>
      m.matches.flatMap((mt) =>
        mt.playersStats.map((ps) => {
          const [competition, season] = m.league.split(/\s(?=[^ ]*$)/)
          const matchKey =
            `${mt.teams[0]} vs ${mt.teams[1]} - ${competition} - ${season.replace('/', '-')} - Week ${m.matchWeek}`
              .replaceAll(' ', '')
              .toLowerCase()
          return Object.entries({
            id: `UUID_TO_BIN('${randomUUID()}',1)`,
            player_id: `UUID_TO_BIN('${playersMapDb.get(ps.name)}',1)`,
            score: parseFloat(ps.score),
            match_id: `UUID_TO_BIN('${matchesMapDb.get(matchKey)}',1)`,
            ...ps.stats,
            starter: ps.stats.starter ? 1 : 0
          })
        })
      )
    )
    .map((ps) => {
      const map = new Map(ps)
      return statsOrder.map((key) => map.get(key) ?? 'NULL')
    })
    .map((ps) =>
      ps.map((value) =>
        typeof value === 'number' ? (isNaN(value) ? 'NULL' : value) : value
      )
    )

  return playersStats
}
