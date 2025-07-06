import { chromium } from 'playwright'
import { getRoundMatches } from './utils/roundMatches.js'
import { writeMatchesData } from './utils/writeFiles.js'

export class Commands {
  constructor () {
    this.leagues = [
      { acrom: 'pl', path: 'premier-league', id: 47 },
      { acrom: 'laliga', path: 'laliga', id: 87 }
    ]
  }

  async rounds (data) {
    const { season, league, options: { round, from = 1, to = 38 } } = data
    const pagePath = this.leagues.find((data) => data.acrom === league)

    let browser
    try {
      browser = await chromium.launch({ headless: false })
      const context = await browser.newContext()
      const page = await context.newPage()

      let footmobPage = `https://www.fotmob.com/leagues/${pagePath.id}/matches/${pagePath.path}?season=${season}&group=by-round`

      await page.route('**/*', (route) => {
        const blocked = ['image', 'font']
        if (blocked.includes(route.request().resourceType())) {
          route.abort()
        } else {
          route.continue()
        }
      })

      if (round) {
        footmobPage += `&round=${round - 1}`
        await page.goto(footmobPage)
        const results = await getRoundMatches({ page })

        try {
          await writeMatchesData({ data: results })
        } catch (Error) {
          console.error(Error)
          process.exit(1)
        } finally {
          await browser.close()
        }
        return
      }

      for (let i = from; i <= to; i++) {
        await page.goto(footmobPage + `&round=${i - 1}`, { waitUntil: 'domcontentloaded' })
        const results = await getRoundMatches({ page })

        try {
          await writeMatchesData({ data: results })
        } catch (Error) {
          console.error('Error writing data', Error)
          process.exit(1)
        }
      }
    } catch (error) {
      console.error(error)
      process.exit(1)
    } finally {
      await browser.close()
    }
  }
}
