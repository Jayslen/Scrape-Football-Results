import path, { parse } from 'path'
import fs from 'fs/promises'
import { Teams } from '@customTypes/teams'
import { MatchDetails } from '@customTypes/matches'
import DB from 'src/db/dbInstance.js'
import { randomUUID } from 'crypto'
import { scapeQuote } from 'src/utils/scapeSqlQuote.js'
import PreloadDBData from './preload.js'

export class FilesParser {
  static async TeamsFiles() {
    const { root } = parse(process.cwd())
    const teamsDirectory = path.join(root, 'football-stats', 'teams')
    const teamsFile = await fs.readdir(teamsDirectory)
    const teamsData: Teams[] = []
    for (const file of teamsFile) {
      const filePath = path.join(teamsDirectory, file)
      const data = await fs.readFile(filePath, 'utf-8')
      const teamsFiles: Teams = JSON.parse(data)
      teamsData.push(teamsFiles)
    }

    const teams = teamsData.flatMap((leagued) =>
      leagued.teams.map((team) => {
        return {
          ...team,
          stadium: {
            ...team.stadium,
            name: team.stadium.name.replaceAll("'", "''"),
          },
          league: leagued.league,
        }
      })
    )

    const countries = teams.flatMap((team) =>
      team.players.map((player) => player.country)
    )
    const positions = teams.flatMap((team) =>
      team.players.flatMap((player) => player.positions)
    )
    const stadiums = teams.map((team) => team.stadium)
    const teamsParse = teams.map((team) => {
      return {
        name: team.teamName,
        league: team.league,
        stadium: team.stadium.name,
      }
    })
    const player = teams.flatMap((team) =>
      team.players.map((player) => {
        return {
          ...player,
          team: team.teamName,
          marketValue:
            player.marketValue.slice(-1) === 'M'
              ? parseFloat(player.marketValue.slice(0, -1)) * 1_000_000
              : parseFloat(player.marketValue.slice(0, -1)) * 1_000,
          shirt: parseInt(player.shirt),
        }
      })
    )
    const playersPositions = teams.flatMap((team) =>
      team.players.flatMap((player) =>
        player.positions.map((position) => ({ player: player.name, position }))
      )
    )

    return {
      countries,
      positions,
      stadiums,
      teams: teamsParse,
      players: player,
      playersPositions,
    }
  }

  static async MatchesFiles() {
    const { root } = parse(process.cwd())

    const matchesDir = path.join(root, 'football-stats', 'matches')
    const matchesFiles = await fs.readdir(matchesDir)

    const matchesData: MatchDetails[] = []

    for (const file of matchesFiles) {
      const leagueDir = path.join(matchesDir, file)
      const leagueSeasons = await fs.readdir(leagueDir)

      for (const season of leagueSeasons) {
        const seasonDir = path.join(leagueDir, season)
        const seasonFiles = await fs.readdir(seasonDir)
        for (const matchFile of seasonFiles) {
          const filePath = path.join(seasonDir, matchFile)
          const fileContent = await fs.readFile(filePath, 'utf-8')
          const matchData: MatchDetails = JSON.parse(fileContent)
          matchesData.push(matchData)
        }
      }
    }

    const db = await DB.getInstance()
    const teamsDb = await PreloadDBData.teams()
    const stadiumsDb = await PreloadDBData.stadiums()

    const stadiumsNotInDB = [
      ...new Set(
        matchesData
          .flatMap((data) => data.matches.map((match) => match.details.stadium))
          .filter((stadium) => !stadiumsDb.has(stadium))
      ),
    ]

    const teamsNotInDB = [
      ...new Set(
        matchesData
          .flatMap((data) => data.matches.flatMap((match) => match.teams))
          .filter((team) => !teamsDb.has(team))
      ),
    ]

    if (stadiumsNotInDB.length > 0) {
      const values = stadiumsNotInDB
        .map(
          (stadium) =>
            `(UUID_TO_BIN('${randomUUID()}', 1),'${scapeQuote(stadium)}')`
        )
        .join(', ')
      await db.query(
        `INSERT INTO stadiums (stadium_id, stadium) VALUES ${values}`
      )
    }

    if (teamsNotInDB.length > 0) {
      const values = teamsNotInDB
        .map(
          (team) => `(UUID_TO_BIN('${randomUUID()}', 1), '${scapeQuote(team)}')`
        )
        .join(', ')

      await db.query(`INSERT INTO teams (team_id, name) VALUES ${values}`)
    }
    return matchesData
  }
}
