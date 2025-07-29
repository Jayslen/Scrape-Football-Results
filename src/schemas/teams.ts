import z from 'zod'
import { LEAGUES_AVAILABLE_ENUM } from '../config.js'
import { League } from '@customTypes/core'

export const teamsSchema = z.enum(LEAGUES_AVAILABLE_ENUM as [League, ...League[]])

export const validateTeamsSchema = (input: League) => {
  return teamsSchema.safeParse(input)
}

