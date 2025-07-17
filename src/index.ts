#!/usr/bin/env node

import { program } from 'commander'
import { Commands } from './commands.js'
import { valiateRoundSchema } from './schemas/match.js'
import { prettifyError } from 'zod/v4'
import { validateTeamsSchema } from './schemas/teams.js'
import { League, LeagueSeason, Options } from '@customTypes/global'

const Actions = new Commands()
program
  .name('Scrapping results')
  .version('1.0.0')
  .description('A CLI application for scrapping data for footmob')

program
  .command('round <league> <season>')
  .description('Fetch rounds for a specific league')
  .option('-r, --round <number>', 'Get a specific round')
  .option('-f, --from <number>', 'Define the start round')
  .option('-t, --to <number>', 'Define limit round')
  .action(async (league: League, season: LeagueSeason, options) => {

    const modifiedOptions: Options = Object.fromEntries(
      Object.entries(options).map(([key, value]) => {
        if (value) {
          return [key, Number(value)]
        }
        return [key, undefined]
      })
    )

    const { success, data, error } = valiateRoundSchema({ league, season, options: modifiedOptions })

    if (!success) {
      console.error(prettifyError(error))
      return
    }
    await Actions.rounds({ ...data })
  })

program.command('teams <league>')
  .description('Fetch teams for a specific league')
  .action(async (league: League) => {
    const { success, data, error } = validateTeamsSchema(league)
    if (!success) {
      console.error(prettifyError(error))
      return
    }
    await Actions.teams(data)
  })


program.parse()
