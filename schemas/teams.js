import z from 'zod'

const teamsSchema = z.object({
  season: z.string().regex(/^\d{4}-\d{4}$/),
  league: z.enum(['pl', 'laliga'])
})

export const validateTeamsSchema = (input) => {
  return teamsSchema.safeParse(input)
}
