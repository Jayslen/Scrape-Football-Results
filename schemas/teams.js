import z from 'zod'

const teamsSchema = z.object({
  league: z.enum(['pl', 'laliga'])
})

export const validateTeamsSchema = (input) => {
  return teamsSchema.safeParse(input)
}
