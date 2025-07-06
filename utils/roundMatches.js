export async function getRoundMatches ({ page }) {
  const data = { league: null, matchWeek: null, matches: [] }

  const links = await page.$$eval('.e1am6mxg0 a',
    links => {
      return links.map(link => link.getAttribute('href'))
    }
  )

  data.league = await page.locator('.e1i7jfg80').innerText()

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

    const playersAnchor = page.locator('.e1ugt93g0 > .e1ugt93g1 a')

    for (const $a of await playersAnchor.all()) {
      await $a.click()
      await page.waitForSelector('.e1txahpl9', { state: 'visible', timeout: 10000 })

      const [score, name, position] = await page.$eval('.e1txahpl0', data => data.innerText.trim().split('\n'))

      const playerStats = await page.$$eval('.e1txahpl9 .e1txahpl2 li:not(:first-child)', data => {
        const keysToModified = ['accurate_passes', 'shots_on_target', 'tackles_won', 'ground_duels_won', 'aerial_duels_won']

        return data.map(li => {
          const [key, value] = li.innerText.trim().split('\n')

          const camelCaseKey = key.toLowerCase().replaceAll(' ', '_')

          if (keysToModified.includes(camelCaseKey)) {
            const [successful, total] = value.split('/').map((val) => Number(val.replace(/\(\d+%\)/g, '').trim()))
            const missed = total - successful
            const lastWordKey = camelCaseKey.split('_').at(-1)

            const successfulKey = lastWordKey === 'passes' ? 'successful' : lastWordKey === 'target' ? 'on_target' : 'won'
            const missedKey = successfulKey === 'won' ? 'lost' : successfulKey === 'on_target' ? 'off_target' : 'missed'

            const statKey = lastWordKey === 'won' ? camelCaseKey.split('_').slice(0, -1).join('_') : lastWordKey === 'target' ? 'shots' : 'passes'

            return [statKey,
              Object.fromEntries([
                ['total', total],
                [successfulKey, successful],
                [missedKey, missed]
              ])
            ]
          } else {
            return [camelCaseKey, Number(value.trim()) ?? value.trim()]
          }
        })
      })

      data.matches.at(-1).playersStats.push({
        name,
        position,
        score,
        stats: Object.fromEntries(playerStats)
      })

      await page.getByRole('button').and(page.getByText('done')).click()
    }
  }

  data.matchWeek = data.matches[0]?.details?.matchWeek

  return data
}
