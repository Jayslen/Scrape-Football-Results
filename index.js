#!/usr/bin/env node

import { program } from 'commander'
import { Commands } from './commands.js'
import { valiateRoundSchema } from './schemas/match.js'
import { prettifyError } from 'zod/v4'
import { validateTeamsSchema } from './schemas/teams.js'

const Actions = new Commands()
program
  .name('Scrapping results')
  .version('1.0.0')
  .description('A CLI application for scrapping data for footmob')

program.command('round <league> <season>')
  .description('Fetch rounds for a specific league')
  .option('-r, --round <number>', 'Get a specific round')
  .option('-f, --from <number>', 'Define the start round')
  .option('-t, --to <number>', 'Define limit round')
  .action(async (league, season, options) => {
    const modifiedOptions = Object.fromEntries(Object.entries(options)?.map(prop => {
      prop[1] = Number(prop[1])
      return prop
    }))
    const { success, data, error } = valiateRoundSchema({ league, season, options: modifiedOptions })
    if (!success) {
      console.error(prettifyError(error))
      return
    }
    await Actions.rounds({ ...data })
  })

program.command('teams <league>')
  .description('Fetch teams for a specific league')
  .action(async (league) => {
    const { success, data, error } = validateTeamsSchema({ league })
    if (!success) {
      console.error(prettifyError(error))
      return
    }
    await Actions.teams({ league: data.league, season: data.season })
  })

program.parse()
