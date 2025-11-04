import DB from '../db/dbInstance.js'

const countriesMap = new Map<string, string>()
const stadiumsMap = new Map<string, string>()
const teamsMap = new Map<string, string>()
const positionsMap = new Map<string, string>()
const playersWithTeam: {
  player_id: string
  player_name: string
  team: string
}[] = []
const competitionsMap = new Map<string, string>()
const seasonsMap = new Map<string, string>()
const matchesMap = new Map<string, string>()
const playersMap = new Map<string, string>()

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

  static async stadiums(refresh?: boolean): Promise<Map<string, string>> {
    if (stadiumsMap.size > 0 && !refresh) {
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

  static async teams(refresh?: boolean): Promise<Map<string, string>> {
    if (teamsMap.size > 0 && !refresh) {
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

  static async playersWithTeams() {
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

  static async competitions() {
    if (competitionsMap.size > 0) {
      return competitionsMap
    }
    const db = await DB.getInstance()
    const [rows] = (await db.query(
      'SELECT BIN_TO_UUID(league_id, 1) AS league_id, LOWER(REPLACE(league_name, " ", "")) AS league_name FROM competitions'
    )) as [{ league_id: string; league_name: string }[], any]
    rows.forEach((row) => competitionsMap.set(row.league_name, row.league_id))
    return competitionsMap
  }

  static async seasons() {
    if (seasonsMap.size > 0) {
      return seasonsMap
    }
    const db = await DB.getInstance()
    const [rows] = (await db.query(
      'SELECT BIN_TO_UUID(season_id,1) AS season_id,REPLACE(season, "/","-") AS season FROM seasons'
    )) as [{ season_id: string; season: string }[], any]
    rows.forEach((row) => seasonsMap.set(row.season, row.season_id))
    return seasonsMap
  }

  static async players(refresh?: boolean) {
    if (playersMap.size > 0 && !refresh) {
      return playersMap
    }
    const db = await DB.getInstance()
    const [rows] = (await db.query(
      'SELECT BIN_TO_UUID(player_id, 1) AS player_id, player_name FROM players'
    )) as [{ player_id: string; player_name: string }[], []]
    rows.forEach((row) => playersMap.set(row.player_name, row.player_id))
    return playersMap
  }

  static async matches(refresh?: boolean) {
    if (matchesMap.size > 0 && !refresh) {
      return matchesMap
    }
    const db = await DB.getInstance()
    const [rows] = (await db.query(
      `SELECT
  BIN_TO_UUID(m.match_id,1) AS match_id,
  ht.name AS home_team,
  vt.name AS visit_team,
  c.league_name AS competition,
  s.season AS season,
  m.match_week
FROM matches m
LEFT JOIN teams ht ON m.home_team_id = ht.team_id
LEFT JOIN teams vt ON m.visit_team_id = vt.team_id
LEFT JOIN competitions c ON m.competition = c.league_id
LEFT JOIN seasons s ON m.season = s.season_id`
    )) as [
      {
        match_id: string
        home_team: string
        visit_team: string
        competition: string
        season: string
        match_week: number
      }[],
      any
    ]
    rows.forEach((row) => {
      const key =
        `${row.home_team} vs ${row.visit_team} - ${row.competition} - ${row.season} - Week ${row.match_week}`
          .toLowerCase()
          .replaceAll(' ', '')
      matchesMap.set(key, row.match_id)
    })
    return matchesMap
  }
}

export default PreloadDBData
