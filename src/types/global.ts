import { z } from 'zod'
import { teamsSchema } from 'src/schemas/teams.js'
import { roundSchema } from '../schemas/match.js'
import { Page, Browser } from 'playwright'

export type LeagueSeason = `${string}-${string}`
export type Options = {
    round?: number | undefined
    from?: number | undefined
    to?: number | undefined
}
export type League = "premier-league" | "laliga" | "serie" | "bundesliga"
export type LeaguesAvailable = { acrom: League; name: string; id: number }[]
export type RoundSchema = z.infer<typeof roundSchema>
export type TeamsSchema = z.infer<typeof teamsSchema>
export type PageInstance = Page
export type BrowserInstance = Browser | undefined

export type Player = {
    name: string
    positions: string[]
    country: string
    shirt: string
    age: Number
    height: number,
    marketValue: string
}[]

export type Stadium = {
    name: string
    capacity: string
    yearOpened: string
    surface: string
}

export type Team = {
    teamName: string
    players: Player
    stadium: Stadium
}

export type Teams = {
    league: string,
    teams: Team[]
}

export type Goals = {
    scorer?: string
    minute?: string[]
}
export type MatchGoals = Goals[][]

export type PlayerStats = Record<string, number | string | boolean>

export type MatchDetails = {
    league: string
    matchWeek: string | undefined,
    matches: {
        goals: MatchGoals
        teams: string[]
        playersStats: {
            name: string
            position: string
            score: string
            stats: PlayerStats
        }[],
        details: {
            date: string
            referee?: string
            stadium: string
            attendance?: string
        }
    }[]
}

