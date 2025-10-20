import { getRoundMatches } from './parseRoundMatches.js'
import { getTeams } from './parseTeams.js'
import { writeData } from '../../utils/writeFiles.js'
import { League, LeaguesAvailable } from '@customTypes/core'
import { RoundSchema } from '@customTypes/matches'
import { BrowserInstance, PageInstance } from '@customTypes/browser'

export class ScrapeDataCommands {
  static async rounds(input: { RoundSchema: RoundSchema, initializeBrowser: () => Promise<{ page: PageInstance, browser: BrowserInstance }>, leaguesAvailable: LeaguesAvailable }) {
    const { RoundSchema, initializeBrowser, leaguesAvailable } = input
    const { season, league, options: { round, from = 1, to = 38 } } = RoundSchema

    const leagueSelected = leaguesAvailable.find((data) => data.acrom === league)

    if (!leagueSelected) {
      console.error(`League ${league} not found.`)
      process.exit(1)
    }

    const { browser, page } = await initializeBrowser()

    const roundStart = round ?? from
    const roundEnd = round ?? to
    const totalRounds = roundEnd - roundStart + 1

    console.log(`Fetching ${round ? `round ${round}` : `${totalRounds}`} for ${leagueSelected.name} in season ${season}... \nTotal matches to Fetch: ${totalRounds * 10}`)

    let footmobPage = `https://www.fotmob.com/leagues/${leagueSelected.id}/matches/${leagueSelected.acrom}?season=${season}&group=by-round`

    let matchesFetched = 0

    for (let i = roundStart; i <= roundEnd; i++) {
    await page.goto(footmobPage + `&round=${i - 1}`, { waitUntil: 'load' })
      const { results, updateMatchesFetched } = await getRoundMatches({ page, totalMatches: totalRounds * 10, matchesFetched })

      matchesFetched = updateMatchesFetched
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
    await browser.close()
  }

  static async teams(input: { league: League, initializeBrowser: Function, leaguesAvailable: LeaguesAvailable }) {
    const { league, leaguesAvailable, initializeBrowser } = input
    const leagueSelected = leaguesAvailable.find((data) => data.acrom === league)

    if (!leagueSelected) {
      console.error(`League ${league} not found.`)
      process.exit(1)
    }

    const { browser, page } = await initializeBrowser()

    const url = `https://www.fotmob.com/leagues/${leagueSelected.id}/table/${leagueSelected.acrom}`

    try {
      const teams = await getTeams({ page, url, leagueName: leagueSelected.name })

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
