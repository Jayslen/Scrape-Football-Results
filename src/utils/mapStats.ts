// Doing by AI
import { Stats } from '@customTypes/matches'

// Helper to dynamically cast raw stats to Stats type
export function mapToStats(rawStats: Record<string, string | number>): Stats {
  const stats: Partial<Stats> = {}

  // List of required fields in Stats
  const requiredFields: (keyof Stats)[] = [
    'minutes_played',
    'passes_total',
    'passes_successful',
    'passes_missed',
    'recoveries',
    'touches',
    'starter'
  ]

  // Set required fields
  requiredFields.forEach((key) => {
    if (key === 'starter') {
      stats[key] = Boolean(rawStats[key])
    } else {
      stats[key] = Number(rawStats[key]) || 0
    }
  })

  // Set optional fields dynamically if they exist in rawStats
  for (const key in rawStats) {
    if (!(key in stats)) {
      const value = rawStats[key]
      stats[key as keyof Stats] =
        typeof value === 'string' && !isNaN(Number(value))
          ? Number(value)
          : (value as any)
    }
  }

  return stats as Stats
}
