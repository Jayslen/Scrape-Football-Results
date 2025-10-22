export enum BasicInsertions {
  LEAGUES = 'leagues',
  COUNTRIES = 'countries',
  POSITIONS = 'positions',
  STADIUMS = 'stadiums',
  PLAYERS = 'players',
  TEAMS = 'teams',
  PLAYERS_POSITIONS = 'playersPositions',
}

export interface FilesData {
  countriesValues: string[][]
  positionsValues: string[][]
  stadiumsValues: string[][]
  teamsValues: string[][]
  playersValues: string[][]
  playersPositionsValues: string[][]
  leaguesValues: string[][]
}

export enum Position {
  Am = 'AM',
  Attacker = 'Attacker',
  CM = 'CM',
  Cb = 'CB',
  Coach = 'Coach',
  Defender = 'Defender',
  Dm = 'DM',
  Gk = 'GK',
  LB = 'LB',
  LM = 'LM',
  Lw = 'LW',
  Lwb = 'LWB',
  Midfielder = 'Midfielder',
  Rb = 'RB',
  Rm = 'RM',
  Rw = 'RW',
  Rwb = 'RWB',
  St = 'ST',
}

export interface FilesTeamsData {
  name: string
  league: League
  stadium: string
}

export enum League {
  Bundesliga = 'Bundesliga',
  LaLiga = 'La Liga',
  PremierLeague = 'Premier League',
  SerieA = 'Serie A',
}

export interface PlayersDatum {
  name: string
  country: string
  team: string
}

export interface PlayersPositionFullDatum {
  player: string
  position: Position
  team: string
}

export interface StadiumsDatum {
  name: string
  capacity: string
  yearOpened: string
  surface: Surface
}

export enum Surface {
  Grass = 'Grass',
}
