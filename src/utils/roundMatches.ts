import { PageInstance, MatchDetails, MatchGoals, Goals, PlayerStats } from "@customTypes/global"
import { statMappings } from './constants.js'
import { MATCH_ELEMENT_SELECTORS } from './constants.js'

const { __matchAnchors,
  __league,
  __matchWeek,
  __teams,
  __goalsList,
  __matchDetails,
  __matchStatus,
  __startersPlayersAnchor,
  __benchPlayersAnchor,
  __playerStatsPopup,
  __platerStats } = MATCH_ELEMENT_SELECTORS

export async function getRoundMatches(input: { page: PageInstance, totalMatches: number, matchesFetched: number }) {
  const { page, totalMatches } = input
  const data: MatchDetails = { league: '', matchWeek: '', matches: [] }
  let { matchesFetched } = input

  const matchLinks = await page.$$eval(__matchAnchors,
    links => {
      return links.map(link => link.getAttribute('href'))
    }
  )

  data.league = await page.locator(__league).innerText()
  data.matchWeek = (await page.locator(__matchWeek).innerText()).split(' ').at(-1)


  for (const matchLink of matchLinks) {
    await page.goto(`https://www.fotmob.com${matchLink}`, { waitUntil: 'load' })
    // extract teams
    const teams = await page.locator(__teams).allInnerTexts()

    const matchGoals: MatchGoals = await page.$$eval(__goalsList, $uls => {
      return $uls.map((ul) => {
        const goals: Goals[] = []
        ul.querySelectorAll('li').forEach((li: HTMLElement) => {
          const scorer = li.querySelector('a span:first-child')?.textContent?.trim() || ''
          const minute = li.querySelector('a span:nth-child(2)')?.textContent?.trim() || ''
          goals.push({ minute: minute.replaceAll('\'', '').split(', '), scorer })
        })
        return goals
      })
    })

    const [date, stadium, referee, attendance] = (await page.locator(__matchDetails).allInnerTexts()).join('\n').split('\n')

    data.matches.push({
      teams,
      goals: matchGoals,
      playersStats: [],
      details: {
        date,
        stadium,
        attendance,
        referee
      }
    })

    if (await page.locator(__matchStatus).innerText() === 'Abandoned') continue
    // extract players stats
    const startersPlayersAnchor = await page.locator(__startersPlayersAnchor).all()
    const benchPlayersAnchor = await page.locator(__benchPlayersAnchor).all()

    const allPlayers = [...startersPlayersAnchor, ...benchPlayersAnchor]
    for (const $a of allPlayers) {
      const iteration = allPlayers.indexOf($a) + 1

      await $a.click()
      await page.waitForSelector(__playerStatsPopup, { state: 'visible' })

      const [score, name, position] = await page.$eval(__playerStatsPopup, (data: HTMLElement) => data.innerText.trim().split('\n'))

      const playerStats: PlayerStats = await page.$$eval(__platerStats, (data, specialStats) => {
        return data.reduce((acc: Record<string, string | number>, li) => {
          li = li as HTMLElement
          const [key, value] = li.innerText.trim().split('\n')
          const camelCaseKey = key.toLowerCase().replaceAll(' ', '_')

          type StatsMappingKey = keyof typeof specialStats;

          if (specialStats[camelCaseKey as StatsMappingKey]) {
            const [successful, total] = value.split('/').map((val) => Number(val.replace(/\(\d+%\)/g, '').trim()))
            const missed = total - successful
            const { baseKey, successKey, failKey } = specialStats[camelCaseKey as StatsMappingKey]

            acc[`${baseKey}_total`] = total
            acc[`${baseKey}_${successKey}`] = successful
            acc[`${baseKey}_${failKey}`] = missed
          } else {
            const cleanedValue = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim())
            acc[camelCaseKey] = cleanedValue
          }

          return acc
        }, {})
      }, statMappings)

      playerStats.starter = iteration <= 22

      const lastMatch = data.matches.at(-1)
      if (lastMatch) {
        lastMatch.playersStats.push({
          name,
          position,
          score,
          stats: playerStats
        })
      }
      await page.getByRole('button').and(page.getByText('done')).click()
    }
    console.log(`${teams[0]} vs ${teams[1]} matchweek ${data.matchWeek} stats collected.`)
    console.log(`${++matchesFetched} / ${totalMatches} Matches collected.`)
  }


  return { results: data, updateMatchesFetched: matchesFetched }
}
