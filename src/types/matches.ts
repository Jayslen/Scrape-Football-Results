import { z } from 'zod'
import { roundSchema } from '../schemas/match.js'

export type RoundSchema = z.infer<typeof roundSchema>

export type Goals = {
    scorer?: string
    minute?: string[]
}
export type MatchGoals = Goals[][]

export type PlayerStats = Record<string, number | string | boolean>

export type MatchDetails = {
    league: string
    matchWeek?: string
    matches: {
        goals: MatchGoals
        teams: string[]
        playersStats: {
            name: string
            position: string
            score: string
            stats: PlayerStats
        }[]
        details: {
            date: string
            referee?: string
            stadium: string
            attendance?: string
        }
    }[]
}
