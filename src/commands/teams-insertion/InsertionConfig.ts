import { Insertions } from '@customTypes/core'

interface InsertConfig {
  table: string
  columns: string[]
  dataInserted: string
}

export const InsertionConfig: Record<Insertions, InsertConfig> = {
  leagues: {
    table: 'competitions',
    columns: ['league_name', 'league_id', 'country_id'],
    dataInserted: 'leagues'
  },
  countries: {
    table: 'countries',
    columns: ['country', 'country_id'],
    dataInserted: 'countries'
  },
  positions: {
    table: 'positions',
    columns: ['position', 'position_id'],
    dataInserted: 'positions'
  },
  stadiums: {
    table: 'stadiums',
    columns: ['stadium_id', 'stadium', 'capacity', 'inaguration', 'surface'],
    dataInserted: 'stadiums'
  },
  teams: {
    table: 'teams',
    columns: ['team_id', 'name', 'country_id', 'stadium_id'],
    dataInserted: 'teams'
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
      'team_id'
    ],
    dataInserted: 'players'
  },
  playersPositions: {
    table: 'player_positions',
    columns: ['player_id', 'position_id'],
    dataInserted: 'player_positions'
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
      'referee'
    ],
    dataInserted: 'matches'
  },
  goals: {
    table: 'match_goals',
    columns: [
      'match_id',
      'player_id',
      'team_id',
      'main_minute',
      'added_minute',
      'is_penalty',
      'is_own_goal'
    ],
    dataInserted: 'Matches goals'
  },
  playersStats: {
    table: 'player_matches_stats',
    columns: [
      'id',
      'player_id',
      'match_id',
      'score',
      'minutes_played',
      'saves',
      'goals_conceded',
      'xgot_faced',
      'passes_total',
      'passes_successful',
      'passes_missed',
      'long_balls_total',
      'long_balls_successful',
      'long_balls_missed',
      'acted_as_sweeper',
      'high_claim',
      'diving_save',
      'saves_inside_box',
      'punches',
      'throws',
      'recoveries',
      'fantasy_points',
      'touches',
      'starter',
      'goals',
      'assists',
      'total_shots',
      'chances_created',
      '`xg_+_xa`',
      '`expected_assists_(xa)`',
      'defensive_contributions',
      'touches_in_opposition_box',
      'passes_into_final_third',
      'dispossessed',
      'tackles',
      'blocks',
      'clearances',
      'headed_clearance',
      'interceptions',
      'dribbled_past',
      'ground_duels_total',
      'ground_duels_won',
      'ground_duels_lost',
      'aerial_duels_total',
      'aerial_duels_won',
      'aerial_duels_lost',
      'was_fouled',
      'fouls_committed',
      'dribbles_total',
      'dribbles_successful',
      'dribbles_missed',
      'crosses_total',
      'crosses_successful',
      'crosses_missed',
      '`expected_goals_(xg)`',
      '`expected_goals_on_target_(xgot)`',
      'shots_total',
      'shots_on_target',
      'shots_off_target',
      'offsides',
      '`non-penalty_xg`',
      'corners',
      'big_chances_missed',
      'blocked_shots',
      'goals_prevented',
      'last_man_tackle',
      'hit_woodwork',
      'cleared_off_the_line',
      'errors_led_to_goal',
      'penalties_won',
      'conceded_penalty',
      'own_goal',
      'error_led_to_goal',
      'missed_penalty',
      'saved_penalties'
    ],
    dataInserted: 'Players stats'
  }
}
