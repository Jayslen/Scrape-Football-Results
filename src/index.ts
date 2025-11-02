#!/usr/bin/env node

import { program } from 'commander'
import { prettifyError } from 'zod/v4'
import { LEAGUES_AVAILABLE } from './config.js'
import { ScrapeDataCommands } from './commands/scrape/scrappingCommands.js'
import { valiateRoundSchema } from './schemas/match.js'
import { validateTeamsSchema } from './schemas/teams.js'
import { initializeBrowser } from './utils/initializeBrowser.js'
import { League, LeagueSeason, Options } from '@customTypes/core'
import { InsertionCommand } from './commands/teams-insertion/InsertionCommand.js'
import { Insertions } from './types/core.js'
import { parseMatchesFiles } from './loaders/parseMatchesValues.js'
import { ValuesParserMap } from './loaders/parseTeamsValues.js'
import { parseGoalsValues } from './loaders/parseGoalsValues.js'
import DB from './db/dbInstance.js'

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
      error
    } = valiateRoundSchema({ league, season, options: modifiedOptions })

    if (!success) {
      console.error(prettifyError(error))
      process.exit(1)
    }
    await ScrapeDataCommands.rounds({
      RoundSchema: roundData,
      initializeBrowser,
      leaguesAvailable: LEAGUES_AVAILABLE
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
      leaguesAvailable: LEAGUES_AVAILABLE
    })
  })

program
  .command('insert')
  .description('Insert specified data into the database')
  .option('-l, --list <items>', 'Comma-separated list of data types to insert')
  .action(
    async (options: { list?: string; teams?: boolean; matches?: boolean }) => {
      const dataToInsert = options?.list
        ? options.list.split(' ')
        : Object.values(Insertions)

      const isValid = dataToInsert.every((item) =>
        Object.values(Insertions).includes(item as Insertions)
      )

      if (!isValid) {
        console.error('Invalid insertion type provided.')
        process.exit(1)
      }

      const db = await DB.getInstance()
      const command = new InsertionCommand(db)
      for (const insertion of dataToInsert) {
        // goals are inserted along with matches
        if (insertion === Insertions.GOALS) continue
        if (insertion === Insertions.MATCHES) {
          const valuesToInsert = await parseMatchesFiles()
          await command.Insertion(insertion, valuesToInsert)
          const goalsValues = await parseGoalsValues()
          await command.Insertion(Insertions.GOALS, goalsValues)
          continue
        }
        const getValuesFunction = ValuesParserMap.get(insertion as Insertions)
        if (getValuesFunction) {
          const values = await getValuesFunction()
          await command.Insertion(insertion as Insertions, values)
        }
      }
      db.end()
    }
  )

program.parse()
