import { FilesData } from '@customTypes/fs'
import { randomUUID } from 'node:crypto'
import { LEAGUES_AVAILABLE } from '../config.js'
import { FilesParser } from './parseFiles.js'
import { Insertions } from '@customTypes/core'
import PreloadDBData from './preload.js'

const filesData: FilesData = {
  countriesValues: [],
  positionsValues: [],
  stadiumsValues: [],
  teamsValues: [],
  playersValues: [],
  playersPositionsValues: [],
  leaguesValues: LEAGUES_AVAILABLE.map((league) => [
    league.name,
    `UUID_TO_BIN('${randomUUID()}', 1)`,
    `(SELECT country_id FROM countries WHERE LOWER(country) = LOWER('${league.country}'))`,
  ]),
}

const { countries, teams, players, playersPositions, positions, stadiums } =
  await FilesParser.TeamsFiles()

const {
  countriesValues,
  positionsValues,
  stadiumsValues,
  teamsValues,
  playersPositionsValues,
  playersValues,
} = filesData

export const ValuesParserMap = new Map<Insertions, () => Promise<string[][]>>()

ValuesParserMap.set(Insertions.LEAGUES, async () => {
  return filesData.leaguesValues
})

ValuesParserMap.set(Insertions.COUNTRIES, async () => {
  countriesValues.push(
    ...countries.map((country) => [
      country,
      `UUID_TO_BIN('${randomUUID()}', 1)`,
    ])
  )
  return countriesValues
})

ValuesParserMap.set(Insertions.POSITIONS, async () => {
  positionsValues.push(
    ...positions.map((position) => [
      position,
      `UUID_TO_BIN('${randomUUID()}', 1)`,
    ])
  )
  return positionsValues
})

ValuesParserMap.set(Insertions.STADIUMS, async () => {
  stadiumsValues.push(
    ...stadiums.map(({ name, capacity, surface, yearOpened }) => [
      `UUID_TO_BIN('${randomUUID()}', 1)`,
      name,
      capacity,
      yearOpened,
      surface,
    ])
  )
  return stadiumsValues
})

ValuesParserMap.set(Insertions.TEAMS, async () => {
  const countriesDbMap = await PreloadDBData.countries()
  const stadiumDbMap = await PreloadDBData.stadiums()
  teamsValues.push(
    ...teams.map(({ name, league, stadium }) => {
      const country =
        LEAGUES_AVAILABLE.find((lg) => lg.name === league)?.country ?? ''
      return [
        `UUID_TO_BIN('${randomUUID()}', 1)`,
        name,
        `UUID_TO_BIN('${countriesDbMap.get(country)}', 1)`,
        `UUID_TO_BIN('${stadiumDbMap.get(stadium)}', 1)`,
      ]
    })
  )
  return teamsValues
})

ValuesParserMap.set(Insertions.PLAYERS, async () => {
  const countriesDbMap = await PreloadDBData.countries()
  const teamsDbMap = await PreloadDBData.teams()
  playersValues.push(
    ...players.map(
      ({ name, country, team, shirt: shirtNumber, height, marketValue }) => [
        `UUID_TO_BIN('${randomUUID()}', 1)`,
        name,
        `${isNaN(shirtNumber) ? 'NULL' : shirtNumber}`,
        `${isNaN(height) ? 'NULL' : height}`,
        `${isNaN(marketValue) ? 'NULL' : marketValue}`,
        `UUID_TO_BIN('${countriesDbMap.get(country)}', 1)`,
        `UUID_TO_BIN('${teamsDbMap.get(team)}', 1)`,
      ]
    )
  )
  return playersValues
})

ValuesParserMap.set(Insertions.PLAYERS_POSITIONS, async () => {
  const positionsDbMap = await PreloadDBData.positions()
  const playersWithTeam = await PreloadDBData.players()

  playersPositionsValues.push(
    ...playersPositions.map(({ player, position }) => {
      const playerTeam = players.find((p) => p.name === player)?.team
      const playerId = playersWithTeam.find(
        (p) => p.player_name === player && p.team === playerTeam
      )?.player_id
      return [
        `UUID_TO_BIN('${playerId}', 1)`,
        `UUID_TO_BIN('${positionsDbMap.get(position)}', 1)`,
      ]
    })
  )

  return playersPositionsValues
})
