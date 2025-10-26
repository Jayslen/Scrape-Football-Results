#!/usr/bin/env node

import { program } from 'commander'
import { prettifyError } from 'zod/v4'
import { LEAGUES_AVAILABLE } from './config.js'
import { ScrapeDataCommands } from './commands/scrape/scrappingCommands.js'
import { valiateRoundSchema } from './schemas/match.js'
import { validateTeamsSchema } from './schemas/teams.js'
import { initializeBrowser } from './utils/initializeBrowser.js'
import { League, LeagueSeason, Options } from '@customTypes/core'
import { getTeamsDataFiles } from './loaders/parseTeamsFiles.js'
import { InsertionCommand } from './commands/teams-insertion/InsertionCommand.js'
import { BasicInsertions } from './types/core.js'

program
  .name('Scrape Football Results')
  .version('1.0.0')
  .description(
    '⚽ Welcome to Scrape Football Results! ⚽\n Get the latest scores and match data from your favorite leagues.'
  )

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

    const {
      success,
      data: roundData,
      error,
    } = valiateRoundSchema({ league, season, options: modifiedOptions })

    if (!success) {
      console.error(prettifyError(error))
      process.exit(1)
    }
    await ScrapeDataCommands.rounds({
      RoundSchema: roundData,
      initializeBrowser,
      leaguesAvailable: LEAGUES_AVAILABLE,
    })
  })

program
  .command('teams <league>')
  .description('Fetch teams for a specific league')
  .action(async (league: League) => {
    const { success, data: leagueSelected, error } = validateTeamsSchema(league)
    if (!success) {
      console.error(prettifyError(error))
      process.exit(1)
    }
    await ScrapeDataCommands.teams({
      league: leagueSelected,
      initializeBrowser,
      leaguesAvailable: LEAGUES_AVAILABLE,
    })
  })

program
  .command('update-db-teams')
  .description('Insert data from teams files into the database')
  .action(async () => {
    const valuesToInsert = await getTeamsDataFiles()
    const command = await InsertionCommand.getInstance()

    await command.insertTeamsData(
      [
        BasicInsertions.COUNTRIES,
        BasicInsertions.LEAGUES,
        BasicInsertions.POSITIONS,
        BasicInsertions.STADIUMS,
        BasicInsertions.TEAMS,
        BasicInsertions.PLAYERS,
        BasicInsertions.PLAYERS_POSITIONS,
      ],
      valuesToInsert
    )
  })

program.parse()
