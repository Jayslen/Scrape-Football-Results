import { PlayerStats } from '@customTypes/matches'
import { PageInstance } from '@customTypes/browser'
import { MATCH_ELEMENT_SELECTORS, statMappings } from '.././config.js'

const { __platerStats } = MATCH_ELEMENT_SELECTORS

export async function getPlayerStats({
  page,
}: {
  page: PageInstance
}): Promise<PlayerStats> {
  const playerStats: PlayerStats = await page.$$eval(
    __platerStats,
    (data, specialStats) => {
      return data.reduce((acc: Record<string, string | number>, li) => {
        li = li as HTMLElement
        const [key, value] = li.innerText.trim().split('\n')
        const camelCaseKey = key.toLowerCase().replaceAll(' ', '_')

        type StatsMappingKey = keyof typeof specialStats

        if (specialStats[camelCaseKey as StatsMappingKey]) {
          const [successful, total] = value
            .split('/')
            .map((val) => Number(val.replace(/\(\d+%\)/g, '').trim()))
          const missed = total - successful
          const { baseKey, successKey, failKey } =
            specialStats[camelCaseKey as StatsMappingKey]

          acc[`${baseKey}_total`] = total
          acc[`${baseKey}_${successKey}`] = successful
          acc[`${baseKey}_${failKey}`] = missed
        } else {
          const cleanedValue = isNaN(Number(value.trim()))
            ? value.trim()
            : Number(value.trim())
          acc[camelCaseKey] = cleanedValue
        }

        return acc
      }, {})
    },
    statMappings
  )
  return playerStats
}
