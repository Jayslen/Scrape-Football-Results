// src/worker.ts
import { parentPort, workerData } from 'node:worker_threads'
import { initializeBrowser } from './utils/initializeBrowser.js'
import { ScrapeDataCommands } from './commands/scrape/scrappingCommands.js'
import { LEAGUES_AVAILABLE } from './config.js'

async function main() {
  const { season, league, roundToFetch, matchesFetched, totalRounds } = workerData

  await ScrapeDataCommands.rounds({
    season,
    league,
    totalRounds,
    roundToFetch,
    matchesFetched,
    leaguesAvailable: LEAGUES_AVAILABLE,
    initializeBrowser
    })
  parentPort?.postMessage('Worker started')
}

main().catch((err) => {
  parentPort?.postMessage(`❌ Worker error: ${err.message}`)
})
