import { Player, PageInstance, Teams } from "@customTypes/global"
import { TEAM_ELEMENT_SELECTORS } from './constants.js'

const { __teamsAnchor, __stadium, __team, __playersTableRows } = TEAM_ELEMENT_SELECTORS

export async function getTeams(input: { page: PageInstance, url: string, leagueName: string }) {
    const { page, url, leagueName } = input

    await page.goto(url, { waitUntil: 'load' })

    const teamsLinks: string[] = await page.$$eval(__teamsAnchor, (links) =>
        links.map(link => (link as HTMLAnchorElement).href)
    )
    const teamsData: Teams = {
        league: leagueName,
        teams: []
    }
    let teamsFetched = 0

    console.log(`Fetching teams for ${leagueName}...`)
    for (const teamLink of teamsLinks) {
        await page.goto(teamLink, { waitUntil: 'load' })

        // Find a way to improve the stadium data extraction
        const stadiumData = await page.$eval(__stadium, el => (el as HTMLElement).innerText.trim().split('\n'))
        const stadium = {
            name: stadiumData[0],
            capacity: stadiumData[2],
            yearOpened: stadiumData[4],
            surface: stadiumData[6]
        }
        const teamName = await page.$eval(__team, el => (el as HTMLElement).innerText.trim())

        await page.getByRole('link').and(page.getByText('Squad')).click()

        await page.waitForSelector('table', { timeout: 10000 })

        const players: Player = await page.$$eval(__playersTableRows, rows => rows.map((row) => {
            const [name, positions, country, shirt, age, height, marketValue] = Array.from(row.querySelectorAll('td'))
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

        console.log(`Fetched ${teamName} players.`)
        console.log(`${++teamsFetched} / ${teamsLinks.length} Teams collected.`)

        teamsData.teams.push({ teamName, players: players.flat(), stadium })
    }
    return teamsData
}