export interface FilesData {
  countriesValues: string[][]
  positionsValues: string[][]
  stadiumsValues: string[][]
  teamsValues: string[][]
  playersValues: string[][]
  playersPositionsValues: string[][]
  leaguesValues: string[][]
}

export interface TeamsParseData {
  countries: string[]
  positions: string[]
  stadiums: {
    name: string
    capacity: string
    yearOpened: string
    surface: string
  }[]
  teams: { name: string; league: string; stadium: string }[]
  players: {
    name: string
    team: string
    country: string
    marketValue: number
    height: number
    shirt: number
    positions: string[]
  }[]
  playersPositions: { player: string; position: string }[]
}
