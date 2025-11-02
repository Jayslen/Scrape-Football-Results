import { MATCH_ELEMENT_SELECTORS } from '../../config.js'
import {
  MatchDetails,
  MatchGoals,
  PlayersStats,
  Position,
  Stats
} from '@customTypes/matches'
import { PageInstance } from '@customTypes/core'
import { getPlayerStats } from '../../utils/extractPlayerMatchStats.js'

const {
  __matchAnchors,
  __league,
  __matchWeek,
  __teams,
  __goalsEventContainer,
  __matchDetails,
  __attendance,
  __matchStatus,
  __startersPlayersAnchor,
  __benchPlayersAnchor,
  __playerStatsPopup,
  __playerPopupName,
  __playerPopupRaiting,
  __doneButton
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
    .at(-1) as string

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
    const goalScorerStats: PlayersStats[] = []

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

        // Create a util to extract player position from info section to avoid code repetition
        // Some players don't have score, so we check if score element is visible
        const playerHasScore = await page
          .locator(__playerPopupRaiting)
          .isVisible()

        const [name, score, position] = await Promise.all([
          page.locator(__playerPopupName).innerText(),
          playerHasScore
            ? page.locator(__playerPopupRaiting).innerText()
            : 'N/A',
          page.locator('.info-span').first().innerText()
        ])

        goals[i][j] = {
          scorer: name,
          minute: goal.time
        }

        const playerStats: Stats = await getPlayerStats({ page })

        goalScorerStats.push({
          name,
          position: position as Position,
          score,
          stats: playerStats
        })

        await page.locator(__doneButton).click()
      }
    }

    const [date, stadium, referee] = (
      await page.locator(__matchDetails).allInnerTexts()
    )
      .join('\n')
      .split('\n')

    const attendance = (await page.locator(__attendance).last().innerText())
      .split('\n')
      .at(-1)

    data.matches.push({
      teams,
      goals,
      playersStats: [],
      details: {
        date,
        stadium,
        attendance,
        referee
      }
    })

    if ((await page.locator(__matchStatus).innerText()) === 'Abandoned')
      continue

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

      // Create a util to extract player position from info section to avoid code repetition
      // Some players don't have score, so we check if score element is visible
      const playerHasScore = await page
        .locator(__playerPopupRaiting)
        .isVisible()

      const [name, score, position] = await Promise.all([
        page.locator(__playerPopupName).innerText(),
        playerHasScore ? page.locator(__playerPopupRaiting).innerText() : 'N/A',
        page.locator('.info-span').first().innerText()
      ])

      const existingPlayerStats = goalScorerStats.find((ps) => ps.name === name)
      const lastMatch = data.matches.at(-1)
      const isStarter = iteration <= 22

      // reuse goal scorer stats if available
      if (existingPlayerStats) {
        existingPlayerStats.stats.starter = isStarter
        if (lastMatch) {
          await page.locator(__doneButton).click()
          lastMatch.playersStats.push(existingPlayerStats)
          continue
        }
      }

      // extract if player stats is not found in goalScorerStats
      const playerStats = await getPlayerStats({ page })
      playerStats.starter = isStarter
      if (lastMatch) {
        lastMatch.playersStats.push({
          name,
          position: position as Position,
          score,
          stats: playerStats
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
