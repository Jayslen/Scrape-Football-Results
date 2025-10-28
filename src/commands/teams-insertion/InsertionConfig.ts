interface InsertConfig {
  table: string
  columns: string[]
  dataInserted: string
}

export const InsertionConfig: Record<string, InsertConfig> = {
  leagues: {
    table: 'competitions',
    columns: ['league_name', 'league_id', 'country_id'],
    dataInserted: 'leagues',
  },
  countries: {
    table: 'countries',
    columns: ['country', 'country_id'],
    dataInserted: 'countries',
  },
  positions: {
    table: 'positions',
    columns: ['position', 'position_id'],
    dataInserted: 'positions',
  },
  stadiums: {
    table: 'stadiums',
    columns: ['stadium_id', 'stadium', 'capacity', 'inaguration', 'surface'],
    dataInserted: 'stadiums',
  },
  teams: {
    table: 'teams',
    columns: ['team_id', 'name', 'country_id', 'stadium_id'],
    dataInserted: 'teams',
  },
  players: {
    table: 'players',
    columns: [
      'player_id',
      'player_name',
      'shirt_number',
      'height',
      'market_value',
      'country_id',
      'team_id',
    ],
    dataInserted: 'players',
  },
  playersPositions: {
    table: 'player_positions',
    columns: ['player_id', 'position_id'],
    dataInserted: 'player_positions',
  },
  matches: {
    table: 'matches',
    columns: [
      'match_id',
      'home_team_id',
      'visit_team_id',
      'attendance',
      'season',
      'competition',
      'match_week',
      'match_date',
      'stadium_id',
      'referee',
    ],
    dataInserted: 'matches',
  },
}
