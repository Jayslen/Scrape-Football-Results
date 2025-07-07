import { chromium } from 'playwright'
import { getRoundMatches } from './utils/roundMatches.js'
import { writeData } from './utils/writeFiles.js'
import { blockExtraResources } from './utils/blockExtraResourses.js'

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
      blockExtraResources(page)

      let footmobPage = `https://www.fotmob.com/leagues/${pagePath.id}/matches/${pagePath.path}?season=${season}&group=by-round`

      if (round) {
        footmobPage += `&round=${round - 1}`
        await page.goto(footmobPage)
        const results = await getRoundMatches({ page })

        try {
          await writeData({
            data: results,
            dir: `${results.league.replaceAll(' ', '-')}`,
            fileName: `/${results.matchWeek.replaceAll(' ', '-')}.json`
          })
        } catch (Error) {
          console.error(Error)
          process.exit(1)
        } finally {
          await browser.close()
        }
        return
      }

      for (let i = from; i <= to; i++) {
        await page.goto(footmobPage + `&round=${i - 1}`, { waitUntil: 'load' })
        const results = await getRoundMatches({ page })

        try {
          await writeData({
            data: results,
            dir: `${results.league.replaceAll(' ', '-')}`,
            fileName: `/${results.matchWeek.replaceAll(' ', '-')}.json`
          })
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

  async teams ({ league, season }) {
    const pagePath = this.leagues.find((data) => data.acrom === league)

    const url = `https://www.fotmob.com/leagues/${pagePath.id}/table/${pagePath.path}?season=${season}`

    let browser
    try {
      browser = await chromium.launch({ headless: false })
      const context = await browser.newContext()
      const page = await context.newPage()
      blockExtraResources(page)

      await page.goto(url, { waitUntil: 'load' })

      const teamsLinks = await page.$$eval('.eo46u7w0 > a', links => links.map(link => link.href.replace('overview', 'squad')))

      const teams = []
      for (const teamLink of teamsLinks.slice(0, 1)) {
        await page.goto(teamLink, { waitUntil: 'load' })

        const teamName = await page.$eval('.e1i7jfg82 .e1i7jfg81', el => el.innerText.trim())
        const players = await page.$$eval('table tbody > tr', rows => rows.map((row) => {
          const data = row.innerText.trim().split('\n').map(text => text.trim())
          const players = []
          const [name, positions, country, extra] = data
          const [shirt, age, height, value] = extra.replace(/cm|€/g, '').split('\t')
            .map((data) => Number.isNaN(Number(data)) ? data : Number(data))

          players.push({ name, positions: positions.split(', '), country, shirt, age, height, value })
          return players
        }))

        teams.push({ teamName, players: players.flat() })
      }

      writeMatchesData({
        data: teams,
        dir: `teams/${league}`,
        fileName: `/${season.replace('-', '_')}.json`
      })
      console.log(teams)
    } catch (error) {
      console.error(error)
      process.exit(1)
    } finally {
      await browser.close()
    }
  }
}
