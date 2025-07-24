import z from 'zod'
import { League } from '@customTypes/global'
import { LEAGUES_AVAILABLE_ENUM } from '../utils/constants.js'

export const teamsSchema = z.enum(LEAGUES_AVAILABLE_ENUM as [League, ...League[]])

export const validateTeamsSchema = (input: League) => {
  return teamsSchema.safeParse(input)
}

