import fs from 'node:fs/promises'
import path, { parse } from 'node:path'
import { FilesData } from '@customTypes/fs/teams'
import { Teams } from '@customTypes/teams'
import { randomUUID } from 'node:crypto'
import { LEAGUES_AVAILABLE } from 'src/config.js'

const { root } = parse(process.cwd())

const teamsDirectory = path.join(root, 'football-stats', 'teams')

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

export async function getTeamsDataFiles(): Promise<FilesData> {
  const teamsFile = await fs.readdir(teamsDirectory)
  const {
    countriesValues,
    positionsValues,
    stadiumsValues,
    teamsValues,
    playersPositionsValues,
    playersValues,
  } = filesData

  for (const file of teamsFile) {
    const filePath = path.join(teamsDirectory, file)
    const data = await fs.readFile(filePath, 'utf-8')
    const teamsData: Teams = JSON.parse(data)

    // countries data
    teamsData.teams
      .flatMap((team) => team.players.map((player) => player.country))
      .forEach((countries) =>
        countriesValues.push([countries, `UUID_TO_BIN('${randomUUID()}')`])
      )

    // positions data
    teamsData.teams
      .flatMap((team) => team.players.flatMap((player) => player.positions))
      .forEach((position) =>
        positionsValues.push([position, `UUID_TO_BIN('${randomUUID()}')`])
      )

    // stadiums data
    teamsData.teams
      .map((stadium) => {
        return {
          ...stadium.stadium,
          name: stadium.stadium.name,
        }
      })
      .forEach((stadium) =>
        stadiumsValues.push([
          `UUID_TO_BIN('${randomUUID()}')`,
          stadium.name.replaceAll("'", "''"),
          stadium.capacity,
          stadium.yearOpened,
          stadium.surface,
        ])
      )

    // teams data
    teamsData.teams
      .map((team) => {
        return {
          name: team.teamName,
          league: teamsData.league,
          stadium: team.stadium.name.replaceAll("'", "''"),
        }
      })
      .forEach((team) => {
        teamsValues.push([
          `UUID_TO_BIN('${randomUUID()}')`,
          team.name,
          `(SELECT country_id FROM competitions WHERE LOWER(league_name) = LOWER('${team.league}'))`,
          `(SELECT stadium_id FROM stadiums WHERE LOWER(stadium) = LOWER('${team.stadium}'))`,
        ])
      })

    // players data
    teamsData.teams
      .flatMap((team) =>
        team.players.map((player) => ({
          name: player.name,
          country: player.country,
          team: team.teamName,
          shirtNumber: parseInt(player.shirt),
          height: player.height,
          marketValue:
            player.marketValue.slice(-1) === 'M'
              ? parseFloat(player.marketValue.slice(0, -1)) * 1_000_000
              : parseFloat(player.marketValue.slice(0, -1)) * 1_000,
        }))
      )
      .forEach((player) => {
        playersValues.push([
          `UUID_TO_BIN('${randomUUID()}')`,
          player.name,
          `${
            isNaN(player.shirtNumber)
              ? 'NULL'
              : `CAST(${player.shirtNumber} AS SIGNED)`
          }`,
          `CAST('${player.height}' AS SIGNED)`,
          `${
            isNaN(player.marketValue)
              ? 'NULL'
              : `CAST(${player.marketValue} AS SIGNED)`
          }`,
          `(SELECT country_id FROM countries WHERE LOWER(country) = LOWER('${player.country}'))`,
          `(SELECT team_id FROM teams WHERE LOWER(name) = LOWER('${player.team}'))`,
        ])
      })

    // players positions data
    teamsData.teams.forEach((team) => {
      team.players.forEach((player) => {
        player.positions.forEach((position) => {
          playersPositionsValues.push([
            `(SELECT player_id FROM players 
    WHERE LOWER(player_name) = LOWER('${player.name.replace(/'/g, "\\'")}')
    AND team_id = (SELECT team_id FROM teams WHERE LOWER(name) = LOWER('${team.teamName.replace(
      /'/g,
      "\\'"
    )}'))
  )`,
            `(SELECT position_id FROM positions WHERE LOWER(position) = LOWER('${position}'))`,
          ])
        })
      })
    })
  }

  return { ...filesData }
}
