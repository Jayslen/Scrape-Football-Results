#!/usr/bin/env node

import { program } from 'commander'
import { prettifyError } from 'zod/v4'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'
import { LEAGUES_AVAILABLE } from './config.js'
import { ScrapeDataCommands } from './commands/scrape/scrappingCommands.js'
import { valiateRoundSchema } from './schemas/match.js'
import { validateTeamsSchema } from './schemas/teams.js'
import { initializeBrowser } from './utils/initializeBrowser.js'
import { League, LeagueSeason, Options } from '@customTypes/core'
import { InsertionCommand } from './commands/teams-insertion/InsertionCommand.js'
import { Insertions } from './types/core.js'
import { ValuesParserMap } from './loaders/mapValues.js'
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
  .option('-f, --from <number>', 'Define the start round', '1')
  .option('-t, --to <number>', 'Define limit round', '38')
  .option('-p, --parallel', 'Doing the process in parallel workers')
  .action(async (league: League, season: LeagueSeason, options: Options) => {
    const modifiedOptions: Options = {
      ...options,
      from: Number(options.from),
      to: Number(options.to),
      round: options.round ? Number(options.round) : undefined
    }

    const {
      success,
      data: roundData,
      error
    } = valiateRoundSchema({ league, season, options: modifiedOptions })

    if (!success) {
      console.error(prettifyError(error))
      process.exit(1)
    }

    const { from, to, round } = roundData.options

    const roundStart = round ?? roundData.options.from
    const totalRounds = round ?? to - from + 1

    const roundToFetch = new Int32Array(new SharedArrayBuffer(4))
    const matchesFetched = new Int32Array(new SharedArrayBuffer(4))
    roundToFetch[0] = roundStart

    if (!options.parallel) {
      console.log(
        `Starting scraping ${totalRounds} rounds for ${league} - ${season}`
      )
      await ScrapeDataCommands.rounds({
        season,
        league,
        totalRounds,
        roundToFetch,
        matchesFetched,
        initializeBrowser,
        leaguesAvailable: LEAGUES_AVAILABLE
      })
      return
    }

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const workerPath = path.resolve(__dirname, 'worker.js')

    const workerPromises = []
    console.log(`Starting scraping ${totalRounds} for ${league} - ${season}`)
    for (let i = 0; i < 2; i++) {
      const worker = new Worker(workerPath, {
        workerData: {
          season: roundData.season,
          league: roundData.league,
          totalRounds,
          roundToFetch,
          matchesFetched
        }
      })

      const promise = new Promise((resolve, reject) => {
        worker.on('message', (msg) => {
          console.log(`Message from worker: ${msg}`)
        })

        worker.on('exit', (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`))
          else resolve('Worker completed successfully')
        })

        worker.on('error', reject)
      })

      workerPromises.push(promise)
    }
    await Promise.all(workerPromises)
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
