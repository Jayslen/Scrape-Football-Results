import { Page, Browser } from 'playwright'

export type LeagueSeason = `${string}-${string}`
export type Options = {
  round?: number
  from?: number
  to?: number
}
export type League = 'premier-league' | 'laliga' | 'serie' | 'bundesliga'
export type LeaguesAvailable = {
  acrom: League
  name: string
  id: number
  country?: string
}[]
export type PageInstance = Page
export type BrowserInstance = Browser | undefined

export enum Insertions {
  LEAGUES = 'leagues',
  COUNTRIES = 'countries',
  POSITIONS = 'positions',
  STADIUMS = 'stadiums',
  TEAMS = 'teams',
  PLAYERS = 'players',
  PLAYERS_POSITIONS = 'playersPositions',
  MATCHES = 'matches',
  GOALS = 'goals'
}
