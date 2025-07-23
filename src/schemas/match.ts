import z from 'zod'
import { RoundSchema } from '@customTypes/global'

export const roundSchema = z.object({
  season: z.string().regex(/^\d{4}-\d{4}$/),
  league: z.enum(['premier-league', 'laliga', 'serie']),
  options: z.object({
    round: z.number().min(1).max(38).optional(),
    from: z.number().min(1).max(38).optional(),
    to: z.number().min(1).max(38).optional()
  })

})

export const valiateRoundSchema = (input: RoundSchema) => {
  return roundSchema.safeParse(input)
}
