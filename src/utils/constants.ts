import { LeaguesAvailable } from "@customTypes/global"

export const statMappings = {
    accurate_passes: { baseKey: 'passes', successKey: 'successful', failKey: 'missed' },
    shots_on_target: { baseKey: 'shots', successKey: 'on_target', failKey: 'off_target' },
    tackles_won: { baseKey: 'tackles', successKey: 'won', failKey: 'lost' },
    ground_duels_won: { baseKey: 'ground_duels', successKey: 'won', failKey: 'lost' },
    aerial_duels_won: { baseKey: 'aerial_duels', successKey: 'won', failKey: 'lost' },
    accurate_long_balls: { baseKey: 'long_balls', successKey: 'successful', failKey: 'missed' },
    successful_dribbles: { baseKey: 'dribbles', successKey: 'successful', failKey: 'missed' },
    accurate_crosses: { baseKey: 'crosses', successKey: 'successful', failKey: 'missed' }
}

export const MATCH_ELEMENT_SELECTORS = {
    __matchAnchors: ".e1am6mxg0 a",
    __league: ".eptdz4j1",
    __matchWeek: ".css-bp2mp7",
    __teams: ".e10mt4ks1",
    __goalsList: ".e1x5klb29 ul",
    __matchDetails: ".eq21sr51",
    __matchStatus: ".e1edwvyy9",
    __startersPlayersAnchor: ".e1ugt93g0 div > a",
    __benchPlayersAnchor: ".e1ymsyw60:nth-child(8) ul li a",
    __playerStatsPopup: ".e123zo9c9",
    __platerStats: ".e123zo9c10 .e123zo9c2 li:not(:first-child)",
}

export const TEAM_ELEMENT_SELECTORS = {
    __teamsAnchor: ".eo46u7w0 > a",
    __stadium: ".e1vbwb212",
    __team: ".eptdz4j1",
    __playersTableRows: "table tbody tr"
}

export const LEAGUES_AVAILABLE: LeaguesAvailable = [
    { acrom: 'premier-league', name: 'Premier League', id: 47 },
    { acrom: 'laliga', name: 'La Liga', id: 87 }
]