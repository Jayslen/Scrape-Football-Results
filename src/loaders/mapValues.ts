import { Insertions } from '../types/core.js'
import { parseTeamsValues } from './parsers/parseTeamsValues.js'
import { parseMatchesValues } from './parsers/parseMatchesValues.js'
import { parseGoalsValues } from './parsers/parseGoalsValues.js'

export const ValuesParserMap = new Map<
  Insertions,
  () => Promise<(string | number)[][]>
>()

ValuesParserMap.set(Insertions.LEAGUES, async () => {
  return parseTeamsValues(Insertions.LEAGUES)
})

ValuesParserMap.set(Insertions.COUNTRIES, async () => {
  return parseTeamsValues(Insertions.COUNTRIES)
})

ValuesParserMap.set(Insertions.POSITIONS, async () => {
  return parseTeamsValues(Insertions.POSITIONS)
})
ValuesParserMap.set(Insertions.STADIUMS, async () => {
  return parseTeamsValues(Insertions.STADIUMS)
})

ValuesParserMap.set(Insertions.TEAMS, async () => {
  return parseTeamsValues(Insertions.TEAMS)
})

ValuesParserMap.set(Insertions.PLAYERS, async () => {
  return parseTeamsValues(Insertions.PLAYERS)
})
ValuesParserMap.set(Insertions.PLAYERS_POSITIONS, async () => {
  return parseTeamsValues(Insertions.PLAYERS_POSITIONS)
})

ValuesParserMap.set(Insertions.MATCHES, async () => {
  return parseMatchesValues()
})

ValuesParserMap.set(Insertions.GOALS, async () => {
  return parseGoalsValues()
})
