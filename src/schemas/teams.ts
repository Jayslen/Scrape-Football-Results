import z from 'zod'
import { League } from '@customTypes/global'

export const teamsSchema = z.enum(['premier-league', 'laliga'])

export const validateTeamsSchema = (input: League) => {
  return teamsSchema.safeParse(input)
}

