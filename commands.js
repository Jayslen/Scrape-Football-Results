import { chromium } from 'playwright'
import fs from 'fs/promises'
import { getRoundMatches } from './utils/roundMatches.js'

export class Commands {
  constructor () {
    this.leagues = [
      { acrom: 'pl', path: 'premier-league', id: 47 },
      { acrom: 'laliga', path: 'laliga', id: 87 }
    ]
  }

  async rounds (data) {
    const { season, league, options: { round, from = 0, to = 38 } } = data
    const pagePath = this.leagues.find((data) => data.acrom === league)

    let browser
    try {
      browser = await chromium.launch({ headless: true })
      const context = await browser.newContext()
      const page = await context.newPage()

      let footmobPage = `https://www.fotmob.com/leagues/${pagePath.id}/matches/${pagePath.path}?season=${season}&group=by-round`

      if (round) {
        footmobPage += `&round=${round - 1}`
        await page.goto(footmobPage)
        const results = await getRoundMatches({ page })
        const leagueRound = results[0]?.details?.matchWeek

        try {
          await fs.writeFile(`./${leagueRound}.json`, JSON.stringify(results))
          console.log('Datos escritos')
        } catch (e) {
          console.error(e)
        }
        return
      }

      for (let i = from; i <= to; i++) {
        await page.goto(footmobPage + `&round=${i}`)
      }
    } catch (error) {
      console.error(error)
      process.exit(1)
    } finally {
      await browser.close()
    }
  }
}
