import { MATCH_ELEMENT_SELECTORS } from '../../config.js'
import { MatchDetails, MatchGoals, PlayerStats } from '@customTypes/matches'
import { PageInstance } from '@customTypes/core'
import { getPlayerStats } from '../../utils/extractPlayerMatchStats.js'

const {
  __matchAnchors,
  __league,
  __matchWeek,
  __teams,
  __goalsEventContainer,
  __matchDetails,
  __matchStatus,
  __startersPlayersAnchor,
  __benchPlayersAnchor,
  __playerStatsPopup,
  __doneButton,
} = MATCH_ELEMENT_SELECTORS

export async function getRoundMatches(input: {
  page: PageInstance
  totalMatches: number
  matchesFetched: number
}) {
  const { page, totalMatches } = input
  const data: MatchDetails = { league: '', matchWeek: '', matches: [] }
  let { matchesFetched } = input

  const matchLinks = await page.$$eval(__matchAnchors, (links) => {
    return links.map((link) => link.getAttribute('href'))
  })

  data.league = await page.locator(__league).innerText()
  data.matchWeek = (await page.locator(__matchWeek).innerText())
    .split(' ')
    .at(-1)

  for (const matchLink of matchLinks) {
    await page.goto(`https://www.fotmob.com${matchLink}`, { waitUntil: 'load' })
    // extract teams
    const teams = await page.locator(__teams).allInnerTexts()

    // extract goalscorers
    const matchGoalsInfo = await page.$$eval(
      __goalsEventContainer,
      ($containers) => {
        const goals: [
          { href: string | null; time: string[] }[],
          { href: string | null; time: string[] }[]
        ] = [[], []]

        $containers.forEach(($div) => {
          $div = $div as HTMLElement
          const svg = $div.querySelector('svg')?.children[0].children[0]
          const $uls = $div.querySelectorAll('ul')

          if (svg?.getAttribute('data-name') === 'Ellipse 497') {
            $uls.forEach(($ul, index) => {
              for (let i = 0; i < $ul.children.length; i++) {
                const href =
                  $ul.children[i].querySelector('a')?.getAttribute('href') ||
                  null
                const time =
                  $ul.children[i]
                    .querySelector('.elosikn11')
                    ?.textContent?.split(',') || []
                if (href && time) goals[index].push({ href, time })
              }
            })
          }
        })
        return goals
      }
    )

    const goals: MatchGoals = [[], []]
    const goalScorerStats: PlayerStats[] = []
    // extract goalScorers details
    for (let i = 0; i < matchGoalsInfo.length; i++) {
      if (matchGoalsInfo[i].length === 0) {
        goals[i] = []
        continue
      }
      for (let j = 0; j < matchGoalsInfo[i].length; j++) {
        const goal = matchGoalsInfo[i][j]
        await page.locator(`a[href='${goal.href}']`).first().click()
        await page.waitForSelector(__playerStatsPopup, { state: 'visible' })

        const [score, name, position] = await page.$eval(
          __playerStatsPopup,
          (data: HTMLElement) => data.innerText.trim().split('\n')
        )
        goals[i][j] = {
          scorer: name,
          minute: goal.time,
        }

        const playerStats: PlayerStats = await getPlayerStats({ page })

        goalScorerStats.push({ name, position, score, ...playerStats })

        await page.locator(__doneButton).click()
      }
    }

    const [date, stadium, referee, attendance] = (
      await page.locator(__matchDetails).allInnerTexts()
    )
      .join('\n')
      .split('\n')

    data.matches.push({
      teams,
      goals,
      playersStats: [],
      details: {
        date,
        stadium,
        attendance,
        referee,
      },
    })

    if ((await page.locator(__matchStatus).innerText()) === 'Abandoned')
      continue

    // extract players stats
    const startersPlayersAnchor = await page
      .locator(__startersPlayersAnchor)
      .all()
    const benchPlayersAnchor = await page.locator(__benchPlayersAnchor).all()

    const allPlayers = [...startersPlayersAnchor, ...benchPlayersAnchor]
    for (const $a of allPlayers) {
      const iteration = allPlayers.indexOf($a) + 1

      // some players don't have stats, so we skip them
      const playerLink = await $a.getAttribute('href')
      if (!playerLink?.includes(':tab=facts')) continue

      // Improve this part. We have to avoid clicking an goal scorer who has the stats already extracted
      await $a.click()
      await page.waitForSelector(__playerStatsPopup, { state: 'visible' })

      const [score, name, position] = await page.$eval(
        __playerStatsPopup,
        (data: HTMLElement) => data.innerText.trim().split('\n')
      )

      const playerStats =
        goalScorerStats.find((ps) => ps.name === name) ??
        (await getPlayerStats({ page }))

      playerStats.starter = iteration <= 22
      const lastMatch = data.matches.at(-1)
      if (lastMatch) {
        lastMatch.playersStats.push({
          name,
          position,
          score,
          stats: playerStats,
        })
      }
      await page.locator(__doneButton).click()
    }
    console.log(
      `${teams[0]} vs ${teams[1]} matchweek ${data.matchWeek} stats collected.`
    )
    console.log(`${++matchesFetched} / ${totalMatches} Matches collected.`)
  }
  return { results: data, updateMatchesFetched: matchesFetched }
}
