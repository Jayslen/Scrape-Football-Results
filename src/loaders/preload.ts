import DB from 'src/db/dbInstance.js'

const countriesMap = new Map<string, string>()
const stadiumsMap = new Map<string, string>()
const teamsMap = new Map<string, string>()
const positionsMap = new Map<string, string>()
const playersWithTeam: {
  player_id: string
  player_name: string
  team: string
}[] = []

export class PreloadDBData {
  static async countries(): Promise<Map<string, string>> {
    if (countriesMap.size > 0) {
      return countriesMap
    }
    const db = await DB.getInstance()
    const [rows] = (await db.query(
      'SELECT BIN_TO_UUID(country_id, 1) AS country_id, country FROM countries'
    )) as [{ country_id: string; country: string }[], any]

    rows.forEach((row) => countriesMap.set(row.country, row.country_id))

    return countriesMap
  }

  static async stadiums(): Promise<Map<string, string>> {
    if (stadiumsMap.size > 0) {
      return stadiumsMap
    }
    const db = await DB.getInstance()
    const [rows] = (await db.query(
      'SELECT BIN_TO_UUID(stadium_id, 1) AS stadium_id, stadium FROM stadiums'
    )) as [{ stadium_id: string; stadium: string }[], any]

    rows.forEach((stadium) => {
      stadiumsMap.set(stadium.stadium, stadium.stadium_id)
    })

    return stadiumsMap
  }

  static async teams(): Promise<Map<string, string>> {
    if (teamsMap.size > 0) {
      return teamsMap
    }
    const db = await DB.getInstance()
    const [rows] = (await db.query(
      'SELECT BIN_TO_UUID(team_id, 1) AS team_id, name FROM teams'
    )) as [{ team_id: string; name: string }[], any]
    rows.forEach((team) => {
      teamsMap.set(team.name, team.team_id)
    })
    return teamsMap
  }

  static async positions(): Promise<Map<string, string>> {
    if (positionsMap.size > 0) {
      return positionsMap
    }
    const db = await DB.getInstance()
    const [rows] = (await db.query(
      'SELECT BIN_TO_UUID(position_id, 1) AS position_id, position FROM positions'
    )) as [{ position_id: string; position: string }[], any]
    rows.forEach((row) => positionsMap.set(row.position, row.position_id))
    return positionsMap
  }

  static async players() {
    if (playersWithTeam.length > 0) {
      return playersWithTeam
    }

    const db = await DB.getInstance()
    const [rows] = (await db.query(
      'SELECT BIN_TO_UUID(player_id, 1) AS player_id, player_name, t.name AS team FROM players AS p INNER JOIN teams AS t ON t.team_id = p.team_id'
    )) as [{ player_id: string; player_name: string; team: string }[], any]

    playersWithTeam.push(...rows)
    return playersWithTeam
  }
}

export default PreloadDBData
