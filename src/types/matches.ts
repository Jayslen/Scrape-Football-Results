import { z } from 'zod'
import { roundSchema } from '../schemas/match.js'

export type RoundSchema = z.infer<typeof roundSchema>

export type Goals = {
  scorer?: string
  minute?: string[]
}
export type MatchGoals = Goals[][]

export type MatchDetails = {
  league: string
  matchWeek: string
  matches: Match[]
}

export interface Match {
  teams: string[]
  goals: any[]
  playersStats: PlayersStats[]
  details: Details
}

export interface Details {
  date: string
  stadium: string
  referee: string
  attendance?: string
}

export interface PlayersStats {
  name: string
  position: Position
  score: string
  stats: Stats
}

export enum Position {
  Am = 'AM',
  CM = 'CM',
  Cb = 'CB',
  Country = 'Country',
  Dm = 'DM',
  Gk = 'GK',
  LB = 'LB',
  LM = 'LM',
  Lw = 'LW',
  Lwb = 'LWB',
  Position = 'Position',
  Rb = 'RB',
  Rm = 'RM',
  Rw = 'RW',
  Rwb = 'RWB',
  St = 'ST',
}

export interface Stats {
  minutes_played: number
  saves?: number
  goals_conceded?: number
  xgot_faced?: number
  goals_prevented?: number
  passes_total: number
  passes_successful: number
  passes_missed: number
  long_balls_total?: number
  long_balls_successful?: number
  long_balls_missed?: number
  acted_as_sweeper?: number
  high_claim?: number
  diving_save?: number
  saves_inside_box?: number
  punches?: number
  throws?: number
  recoveries: number
  fantasy_points?: number | string
  touches: number
  ground_duels_total?: number
  ground_duels_won?: number
  ground_duels_lost?: number
  starter: boolean
  goals?: number
  assists?: number
  total_shots?: number
  chances_created?: number
  'expected_assists_(xa)'?: number
  'xg_+_xa'?: number
  defensive_contributions?: number
  touches_in_opposition_box?: number
  passes_into_final_third?: number
  crosses_total?: number
  crosses_successful?: number
  crosses_missed?: number
  dispossessed?: number
  tackles?: number
  blocks?: number
  clearances?: number
  headed_clearance?: number
  interceptions?: number
  dribbled_past?: number
  aerial_duels_total?: number
  aerial_duels_won?: number
  aerial_duels_lost?: number
  was_fouled?: number
  fouls_committed?: number
  'expected_goals_(xg)'?: number
  'expected_goals_on_target_(xgot)'?: number
  dribbles_total?: number
  dribbles_successful?: number
  dribbles_missed?: number
  'non-penalty_xg'?: number
  shots_total?: number
  shots_on_target?: number
  shots_off_target?: number
  corners?: number
  blocked_shots?: number
  hit_woodwork?: number
  offsides?: number
  big_chances_missed?: number
  cleared_off_the_line?: number
  penalties_won?: number
  conceded_penalty?: number
  errors_led_to_goal?: number
  last_man_tackle?: number
  error_led_to_goal?: number
}
