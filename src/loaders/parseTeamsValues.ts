import { FilesData } from '@customTypes/fs'
import { randomUUID } from 'node:crypto'
import { LEAGUES_AVAILABLE } from '../config.js'
import { FilesParser } from './parseFiles.js'

const filesData: FilesData = {
  countriesValues: [],
  positionsValues: [],
  stadiumsValues: [],
  teamsValues: [],
  playersValues: [],
  playersPositionsValues: [],
  leaguesValues: LEAGUES_AVAILABLE.map((league) => [
    league.name,
    `UUID_TO_BIN('${randomUUID()}')`,
    `(SELECT country_id FROM countries WHERE LOWER(country) = LOWER('${league.country}'))`,
  ]),
}

export async function getTeamsValues(): Promise<FilesData> {
  const {
    countriesValues,
    positionsValues,
    stadiumsValues,
    teamsValues,
    playersPositionsValues,
    playersValues,
  } = filesData
  const { countries, teams, players, playersPositions, positions, stadiums } =
    await FilesParser.TeamsFiles()

  // countries data
  countriesValues.push(
    ...countries.map((country) => [country, `UUID_TO_BIN('${randomUUID()}')`])
  )

  // positions data
  positionsValues.push(
    ...positions.map((position) => [position, `UUID_TO_BIN('${randomUUID()}')`])
  )
  // stadiums data
  stadiumsValues.push(
    ...stadiums.map(({ name, capacity, surface, yearOpened }) => [
      `UUID_TO_BIN('${randomUUID()}')`,
      name,
      capacity,
      yearOpened,
      surface,
    ])
  )
  // teams data
  teamsValues.push(
    ...teams.map(({ name, league, stadium }) => [
      `UUID_TO_BIN('${randomUUID()}')`,
      name,
      `(SELECT country_id FROM competitions WHERE LOWER(league_name) = LOWER('${league}'))`,
      `(SELECT stadium_id FROM stadiums WHERE LOWER(stadium) = LOWER('${stadium}'))`,
    ])
  )

  // players data
  playersValues.push(
    ...players.map(
      ({ name, country, team, shirt: shirtNumber, height, marketValue }) => [
        `UUID_TO_BIN('${randomUUID()}')`,
        name,
        `${isNaN(shirtNumber) ? 'NULL' : shirtNumber}`,
        `${isNaN(height) ? 'NULL' : height}`,
        `${isNaN(marketValue) ? 'NULL' : marketValue}`,
        `(SELECT country_id FROM countries WHERE LOWER(country) = LOWER('${country}'))`,
        `(SELECT team_id FROM teams WHERE LOWER(name) = LOWER('${team}'))`,
      ]
    )
  )

  // players positions data
  playersPositionsValues.push(
    ...playersPositions.map(({ player, position }) => [
      `(SELECT player_id FROM players
  WHERE LOWER(player_name) = LOWER('${player.replace(/'/g, "\\'")}')
  AND team_id = (SELECT team_id FROM teams WHERE LOWER(name) = LOWER('${players
    .find((p) => p.name === player)
    ?.team.replace(/'/g, "\\'")}'))
)`,
      `(SELECT position_id FROM positions WHERE LOWER(position) = LOWER('${position}'))`,
    ])
  )
  return { ...filesData }
}
