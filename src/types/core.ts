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

export enum BasicInsertions {
  LEAGUES = 'leagues',
  COUNTRIES = 'countries',
  POSITIONS = 'positions',
  STADIUMS = 'stadiums',
  PLAYERS = 'players',
  TEAMS = 'teams',
  PLAYERS_POSITIONS = 'playersPositions',
}
