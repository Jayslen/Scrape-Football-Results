import path, { parse } from 'path'
import fs from 'fs/promises'
import { Teams } from '@customTypes/teams'

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
}
