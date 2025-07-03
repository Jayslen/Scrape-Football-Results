export async function getRoundMatches ({ page }) {
  const matches = []

  const links = await page.$$eval('.e1am6mxg0 a',
    links => {
      return links.map(link => link.getAttribute('href'))
    }
  )

  for (const matchLink of links) {
    await page.goto(`https://www.fotmob.com${matchLink}`, { waitUntil: 'networkidle' })

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

    matches.push({
      teams,
      goals: matchGoals,
      details: {
        date, matchWeek, stadium, attendance
      }
    })
  }

  return matches
}
