import { LeaguesAvailable } from '@customTypes/core'

process.loadEnvFile()

export const databaseConfig = {
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3306
}

export const statMappings = {
  accurate_passes: {
    baseKey: 'passes',
    successKey: 'successful',
    failKey: 'missed'
  },
  shots_on_target: {
    baseKey: 'shots',
    successKey: 'on_target',
    failKey: 'off_target'
  },
  tackles_won: { baseKey: 'tackles', successKey: 'won', failKey: 'lost' },
  ground_duels_won: {
    baseKey: 'ground_duels',
    successKey: 'won',
    failKey: 'lost'
  },
  aerial_duels_won: {
    baseKey: 'aerial_duels',
    successKey: 'won',
    failKey: 'lost'
  },
  accurate_long_balls: {
    baseKey: 'long_balls',
    successKey: 'successful',
    failKey: 'missed'
  },
  successful_dribbles: {
    baseKey: 'dribbles',
    successKey: 'successful',
    failKey: 'missed'
  },
  accurate_crosses: {
    baseKey: 'crosses',
    successKey: 'successful',
    failKey: 'missed'
  }
}

export const MATCH_ELEMENT_SELECTORS = {
  __matchAnchors: '.e1mcimok0',
  __league: '.eptdz4j1',
  __matchWeek: '.css-bp2mp7',
  __teams: '.e10mt4ks1',
  __goalsEventContainer: '.css-1ygojsm-EventContainer',
  __matchDetails: '.eq21sr51',
  __attendance: '.ehqdt6x8 .ehqdt6x9',
  __matchStatus: '.e1a6htip9',
  __startersPlayersAnchor: '.eeniygg1 > a',
  __benchPlayersAnchor: '.e1qn6cib0:nth-child(8) ul li a',
  __playerStatsPopup: '.e7jo42v9',
  __playerPopupRaiting: '.e7jo42v9 .eaxyua0',
  __playerPopupName: '.e7jo42v9 .e7jo42v1',
  __playerPopupInfo: '.e7jo42v8',
  __platerStats: '.e7jo42v10 .e7jo42v5 li:not(:first-child)',
  __doneButton: '.e7jo42v11'
}

export const TEAM_ELEMENT_SELECTORS = {
  __teamsAnchor: '.eo46u7w0 > a',
  __stadium: '.e1vbwb212',
  __team: '.eptdz4j1',
  __playersTableRows: 'table tbody tr'
}

export const LEAGUES_AVAILABLE: LeaguesAvailable = [
  {
    acrom: 'premier-league',
    name: 'Premier League',
    id: 47,
    country: 'England'
  },
  { acrom: 'laliga', name: 'La Liga', id: 87, country: 'Spain' },
  { acrom: 'serie', name: 'Serie A', id: 55, country: 'Italy' },
  { acrom: 'bundesliga', name: 'Bundesliga', id: 54, country: 'Germany' }
]

export const LEAGUES_AVAILABLE_ENUM = LEAGUES_AVAILABLE.map(
  (league) => league.acrom
)
