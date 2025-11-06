import z from 'zod'
import { LEAGUES_AVAILABLE_ENUM } from '../config.js'
import { League } from '@customTypes/core'
import { RoundSchema } from '@customTypes/matches'

export const roundSchema = z.object({
  season: z.string().regex(/^\d{4}-\d{4}$/),
  league: z.enum(LEAGUES_AVAILABLE_ENUM as [League, ...League[]]),
  options: z.object({
    round: z.number().min(1).max(38).optional(),
    from: z.number().min(1).max(38),
    to: z.number().min(1).max(38),
    parallel: z
      .number()
      .min(2, 'In order to use parallel workers, at least 2 is required.')
      .max(
        5,
        'For prevent overload, the maximum number of parallel workers is 5.'
      )
      .optional()
  })
})

export const valiateRoundSchema = (input: RoundSchema) => {
  return roundSchema.safeParse(input)
}
