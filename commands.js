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
    const leagueSelected = this.leagues.find((data) => data.acrom === league)

    let browser
    try {
      browser = await chromium.launch({ headless: false })
      const context = await browser.newContext()
      const page = await context.newPage()
      blockExtraResources(page)

      let footmobPage = `https://www.fotmob.com/leagues/${leagueSelected.id}/matches/${leagueSelected.path}?season=${season}&group=by-round`

      if (round) {
        footmobPage += `&round=${round - 1}`
        await page.goto(footmobPage)
        const results = await getRoundMatches({ page })

        try {
          await writeData({
            data: results,
            dir: `matches/${leagueSelected.path}/${season}`,
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
            dir: `matches/${leagueSelected.path}/${season}`,
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
    const leagueSelected = this.leagues.find((data) => data.acrom === league)

    const url = `https://www.fotmob.com/leagues/${leagueSelected.id}/table/${leagueSelected.path}?season=${season}`

    let browser
    try {
      browser = await chromium.launch({ headless: false })
      const context = await browser.newContext()
      const page = await context.newPage()
      blockExtraResources(page)

      await page.goto(url, { waitUntil: 'load' })

      const teamsLinks = await page.$$eval('.eo46u7w0 > a', links => links.map(link => link.href))

      const teams = []
      for (const teamLink of teamsLinks) {
        await page.goto(teamLink, { waitUntil: 'load' })

        // Find a way to improve the stadium data extraction
        const stadiumData = await page.$eval('.e1vbwb212', el => el.innerText.trim().split('\n'))
        const stadium = {
          name: stadiumData[0],
          capacity: stadiumData[2],
          yearOpened: stadiumData[4],
          surface: stadiumData[6]
        }
        const teamName = await page.$eval('.eptdz4j1', el => el.innerText.trim())

        await page.getByRole('link').and(page.getByText('Squad')).click()

        await page.waitForSelector('table', { timeout: 10000 })

        const players = await page.$$eval('table tbody tr', rows => rows.map((row) => {
          const [name, positions, country, shirt, age, height, marketValue] = row.querySelectorAll('td')
          return {
            name: name.innerText.split('\n')[0],
            positions: positions.innerText.split(', '),
            country: country.innerText,
            shirt: shirt.innerText ?? null,
            age: Number(age.innerText),
            height: Number(height.innerText.replace('cm', '')),
            marketValue: marketValue.innerText.replace('€', '').replace(/,/g, '')
          }
        }))

        teams.push({ teamName, players: players.flat(), stadium })
      }

      writeData({
        data: teams,
        dir: 'teams',
        fileName: `/${leagueSelected.path}-teams.json`
      })
    } catch (error) {
      console.error(error)
      process.exit(1)
    } finally {
      await browser.close()
    }
  }
}
