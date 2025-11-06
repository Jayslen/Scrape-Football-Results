import { getRoundMatches } from './parseRoundMatches.js'
import { getTeams } from './parseTeams.js'
import { writeData } from '../../utils/writeFiles.js'
import { League, LeaguesAvailable } from '@customTypes/core'
import { BrowserInstance, PageInstance } from '@customTypes/browser'

export class ScrapeDataCommands {
  static async rounds(input: {
    season: string
    league: League
    totalRounds: number
    leaguesAvailable: LeaguesAvailable
    roundToFetch: Int32Array
    matchesFetched: Int32Array
    initializeBrowser: () => Promise<{
      browser: BrowserInstance
      page: PageInstance
    }>
  }) {
    const {
      season,
      league,
      totalRounds,
      initializeBrowser,
      leaguesAvailable,
      roundToFetch,
      matchesFetched
    } = input

    const leagueSelected = leaguesAvailable.find(
      (data) => data.acrom === league
    )

    if (!leagueSelected) {
      console.error(`League ${league} not found.`)
      process.exit(1)
    }

    const { browser, page } = await initializeBrowser()
    const footmobPage = `https://www.fotmob.com/leagues/${leagueSelected.id}/matches/${leagueSelected.acrom}?season=${season}&group=by-round`

    while (Atomics.load(roundToFetch, 0) <= totalRounds) {
      const i = Atomics.add(roundToFetch, 0, 1)
      console.log(`Fetching matches for round ${i}...`)
      await page.goto(footmobPage + `&round=${i - 1}`, { waitUntil: 'load' })
      const { results } = await getRoundMatches({
        page,
        totalMatches: totalRounds * 10,
        matchesFetched
      })
      try {
        await writeData({
          data: results,
          dir: `matches/${leagueSelected.acrom}/${season}`,
          fileName: `/${leagueSelected.acrom}-week-${results.matchWeek}.json`
        })
      } catch (Error) {
        console.error('Error writing data:', Error)
      }
    }
    if (Atomics.load(roundToFetch, 0) === totalRounds + 1) {
      await browser.close()
    }
  }

  static async teams(input: {
    league: League
    initializeBrowser: () => Promise<{
      browser: BrowserInstance
      page: PageInstance
    }>
    leaguesAvailable: LeaguesAvailable
  }) {
    const { league, leaguesAvailable, initializeBrowser } = input
    const leagueSelected = leaguesAvailable.find(
      (data) => data.acrom === league
    )

    if (!leagueSelected) {
      console.error(`League ${league} not found.`)
      process.exit(1)
    }

    const { browser, page } = await initializeBrowser()

    const url = `https://www.fotmob.com/leagues/${leagueSelected.id}/table/${leagueSelected.acrom}`

    try {
      const teams = await getTeams({
        page,
        url,
        leagueName: leagueSelected.name
      })

      writeData({
        data: teams,
        dir: 'teams',
        fileName: `/${leagueSelected.acrom}-teams.json`
      })
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      await browser.close()
    }
  }
}
