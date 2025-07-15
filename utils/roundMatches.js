export async function getRoundMatches ({ page }) {
  const data = { league: null, matchWeek: null, matches: [] }

  const links = await page.$$eval('.e1am6mxg0 a',
    links => {
      return links.map(link => link.getAttribute('href'))
    }
  )

  data.league = await page.locator('.eptdz4j1').innerText()

  for (const matchLink of links) {
    await page.goto(`https://www.fotmob.com${matchLink}`, { waitUntil: 'load' })

    const teams = await page.$$eval('.e10mt4ks0', teams => teams.map((node) => {
      return node.textContent
    }))

    const matchGoals = await page.$$eval('.e1vkkyp10 > div:first-child ul', $uls => {
      return $uls.map((ul) => {
        const goals = []
        ul.querySelectorAll('li').forEach((li) => {
          const scorer = li.querySelector('div span:first-child')?.textContent?.trim() || ''
          const minute = li.querySelector('div span:nth-child(2)')?.textContent?.trim() || ''
          goals.push({ scorer, minute })
        })
        return goals
      })
    })

    const [date, matchWeek, stadium, _, attendance] = await page.$eval('.eq21sr51', $ul => {
      return Array.from($ul.children).map(li => li.textContent)
    })

    data.matches.push({
      teams,
      goals: matchGoals,
      playersStats: [],
      details: {
        date, matchWeek, stadium, attendance
      }
    })

    if (await page.locator('.e1edwvyy9').innerText() === 'Abandoned') continue

    const startersPlayersAnchor = await page.locator('.e1ugt93g0 div > a').all()
    const benchPlayersAnchor = await page.locator('.e1ymsyw60:nth-child(8) ul li a').all()

    const allPlayers = [...startersPlayersAnchor, ...benchPlayersAnchor]
    for (const $a of allPlayers) {
      const iteration = allPlayers.indexOf($a) + 1

      await $a.click()
      await page.waitForSelector('.e123zo9c9', { state: 'visible' })

      const [score, name, position] = await page.$eval('.e123zo9c9', data => data.innerText.trim().split('\n'))

      const playerStats = await page.$$eval('.e123zo9c10 .e123zo9c2 li:not(:first-child)', data => {
        const statMappings = {
          accurate_passes: { baseKey: 'passes', successKey: 'successful', failKey: 'missed' },
          shots_on_target: { baseKey: 'shots', successKey: 'on_target', failKey: 'off_target' },
          tackles_won: { baseKey: 'tackles', successKey: 'won', failKey: 'lost' },
          ground_duels_won: { baseKey: 'ground_duels', successKey: 'won', failKey: 'lost' },
          aerial_duels_won: { baseKey: 'aerial_duels', successKey: 'won', failKey: 'lost' },
          accurate_long_balls: { baseKey: 'long_balls', successKey: 'successful', failKey: 'missed' },
          successful_dribbles: { baseKey: 'dribbles', successKey: 'successful', failKey: 'missed' },
          accurate_crosses: { baseKey: 'crosses', successKey: 'successful', failKey: 'missed' }
        }

        return data.reduce((acc, li) => {
          const [key, value] = li.innerText.trim().split('\n')
          const camelCaseKey = key.toLowerCase().replaceAll(' ', '_')

          if (statMappings[camelCaseKey]) {
            const [successful, total] = value.split('/').map((val) => Number(val.replace(/\(\d+%\)/g, '').trim()))
            const missed = total - successful
            const { baseKey, successKey, failKey } = statMappings[camelCaseKey]

            acc[`${baseKey}_total`] = total
            acc[`${baseKey}_${successKey}`] = successful
            acc[`${baseKey}_${failKey}`] = missed
          } else {
            const cleanedValue = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim())
            acc[camelCaseKey] = cleanedValue
          }

          return acc
        }, {})
      })

      playerStats.starter = iteration <= 22

      data.matches.at(-1).playersStats.push({
        name,
        position,
        score,
        stats: playerStats
      })

      await page.getByRole('button').and(page.getByText('done')).click()
    }
  }

  data.matchWeek = data.matches[0]?.details?.matchWeek

  return data
}
