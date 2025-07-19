import { chromium, Page, Browser } from 'playwright'
import { getRoundMatches } from './utils/roundMatches.js'
import { writeData } from './utils/writeFiles.js'
import { blockExtraResources } from './utils/blockExtraResourses.js'
import { League, LeaguesAvailable, Player, RoundSchema, Teams } from '@customTypes/global'
import { getTeams } from './utils/fetchTeams.js'

export class Commands {
  leagues: LeaguesAvailable
  browser: Browser | undefined
  page: Page | undefined
  constructor() {
    this.leagues = [
      { acrom: 'pl', path: 'premier-league', id: 47 },
      { acrom: 'laliga', path: 'laliga', id: 87 }
    ]
  }

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: false })
      const context = await this.browser.newContext()
      this.page = await context.newPage()
      blockExtraResources(this.page)
    } else {
      console.warn('Browser is already initialized.')
    }
    return this
  }

  async rounds(data: RoundSchema) {
    const { season, league, options: { round, from = 1, to = 38 } } = data
    const leagueSelected = this.leagues.find((data) => data.acrom === league)

    if (!leagueSelected) {
      console.error(`League ${league} not found.`)
      process.exit(1)
    }

    if (this.browser === undefined || this.page === undefined) {
      console.error('Browser or page is not initialized. Try again')
      process.exit(1)
    }

    const roundStart = round ?? from
    const roundEnd = round ?? to
    const totalRounds = roundEnd - roundStart + 1

    console.log(`Fetching ${round ? `round ${round}` : `${totalRounds}`} for ${leagueSelected.path} in season ${season}... \nTotal matches to Fetch: ${totalRounds * 10}`)

    let footmobPage = `https://www.fotmob.com/leagues/${leagueSelected.id}/matches/${leagueSelected.path}?season=${season}&group=by-round`

    for (let i = roundStart; i <= roundEnd; i++) {
      await this.page.goto(footmobPage + `&round=${i - 1}`, { waitUntil: 'load' })
      const results = await getRoundMatches({ page: this.page, totalMatches: totalRounds * 10 })

      try {
        await writeData({
          data: results,
          dir: `matches/${leagueSelected.path}/${season}`,
          fileName: `/${leagueSelected.path}-week-${results.matchWeek}.json`
        })
      } catch (Error) {
        console.error('Error writing data:', Error)
      }
      finally {
        await this.browser.close()
      }
    }
  }

  async teams(league: League) {
    const leagueSelected = this.leagues.find((data) => data.acrom === league)

    if (!leagueSelected) {
      console.error(`League ${league} not found.`)
      process.exit(1)
    }

    if (this.browser === undefined || this.page === undefined) {
      console.error('Browser or page is not initialized. Try again')
      process.exit(1)
    }

    const url = `https://www.fotmob.com/leagues/${leagueSelected.id}/table/${leagueSelected.path}`

    try {
      const teams = await getTeams({ page: this.page, url, leagueName: leagueSelected.path })

      writeData({
        data: teams,
        dir: 'teams',
        fileName: `/${leagueSelected.path}-teams.json`
      })
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      await this.browser.close()
    }
  }
}
