import { z } from 'zod'
import { teamsSchema } from '../schemas/teams.js'

export type TeamsSchema = z.infer<typeof teamsSchema>

export type Player = {
    name: string
    positions: string[]
    country: string
    shirt: string
    age: number
    height: number
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
    league: string
    teams: Team[]
}