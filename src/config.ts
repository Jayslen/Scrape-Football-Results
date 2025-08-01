import { LeaguesAvailable } from "@customTypes/core"
import { InsertDataCommand } from "./commands/teams-insertion/insertionCommands.js"
import { getExistingValues, insertRows } from "./db/dbStatements.js"
import { randomUUID } from "crypto"
import { InsertionConfig } from "src/types/fs/teamsFs.js"
import { Stadium } from "@customTypes/teams"

process.loadEnvFile()

export const databaseConfig = {
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATABASE,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3306,
}

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
    __doneButton: ".e123zo9c11"
}

export const TEAM_ELEMENT_SELECTORS = {
    __teamsAnchor: ".eo46u7w0 > a",
    __stadium: ".e1vbwb212",
    __team: ".eptdz4j1",
    __playersTableRows: "table tbody tr"
}

export const LEAGUES_AVAILABLE: LeaguesAvailable = [
    { acrom: 'premier-league', name: 'Premier League', id: 47, country: 'England' },
    { acrom: 'laliga', name: 'La Liga', id: 87, country: 'Spain' },
    { acrom: 'serie', name: 'Serie A', id: 55, country: 'Italy' },
    { acrom: 'bundesliga', name: 'Bundesliga', id: 54, country: 'Germany' },
]

export const LEAGUES_AVAILABLE_ENUM = LEAGUES_AVAILABLE.map(league => league.acrom)

export const INSERTION_CONFIGS: Record<string, InsertionConfig> = {
    leagues: {
        table: 'competitions',
        column: 'league_name',
        dataInserted: 'leagues',
        queriesColumns: 'INSERT INTO competitions (league_name, league_id, country_id) VALUES ',
        generateQueryValues: () => Array.from(LEAGUES_AVAILABLE).map(league =>
            `('${league.name}', UUID_TO_BIN('${randomUUID()}'), (SELECT country_id FROM countries WHERE LOWER(country) = LOWER('${league.country}'))) `
        ),
        getLocalData: () => new Set(LEAGUES_AVAILABLE.map(league => league.name)),
        useInsertAll: true
    },
    countries: {
        table: 'countries',
        column: 'country',
        dataInserted: 'countries',
        queriesColumns: 'INSERT INTO countries (country, country_id) VALUES ',
        generateQueryValues: (countries: Set<string>) => Array.from(countries).map(country =>
            `('${country}', UUID_TO_BIN('${randomUUID()}'))`
        ),
        getLocalData: (countries: Set<string>) => countries,
        useInsertAll: true
    },
    positions: {
        table: 'positions',
        column: 'position',
        dataInserted: 'positions',
        queriesColumns: 'INSERT INTO positions (position, position_id) VALUES ',
        generateQueryValues: (positions: Set<string>) => Array.from(positions).map(position =>
            `('${position}', UUID_TO_BIN('${randomUUID()}'))`
        ),
        getLocalData: (positions: Set<string>) => positions,
        useInsertAll: true
    },
    stadiums: {
        table: 'stadiums',
        column: 'stadium',
        dataInserted: 'stadiums',
        queriesColumns: 'INSERT INTO stadiums (stadium_id, stadium, capacity, inaguration, surface) VALUES ',
        generateQueryValues: () => [],
        getLocalData: () => new Set(),
        useInsertRows: true,
        customLogic: async function (self: InsertDataCommand, input: { filesStadiums: Set<string>, stadiumsFullData: Stadium[] }) {
            const { filesStadiums, stadiumsFullData } = input;

            const { dataToinsert: unsavedStadiums } = await getExistingValues({
                table: 'stadiums',
                column: 'stadium',
                localData: filesStadiums,
                dbConnection: self.getDbConnection()
            });

            insertRows({
                dataInserted: 'stadiums',
                queriesColumns: 'INSERT INTO stadiums (stadium_id, stadium, capacity, inaguration, surface) VALUES ',
                queryValues: Array.from(new Set(stadiumsFullData.filter(stadium => unsavedStadiums.has(stadium.name))
                    .map(stadium => stadium.name)))
                    .map(name => stadiumsFullData.find(stadium => stadium.name === name))
                    .map((stadium) => {
                        if (!stadium) return '';
                        return `(UUID_TO_BIN('${randomUUID()}'),
                        '${stadium.name.replaceAll("'", "''")}',
                        ${parseInt(stadium.capacity.replace(',', ''))},
                        '${parseInt(stadium.yearOpened)}',
                        '${stadium.surface}')`;
                    }),
                dbConnection: self.getDbConnection()
            });
        }
    },
    teams: {
        table: 'teams',
        column: 'name',
        dataInserted: 'teams',
        queriesColumns: 'INSERT INTO teams (team_id, name, country_id, stadium_id) VALUES ',
        generateQueryValues: () => [], // Will be handled by custom logic
        getLocalData: () => new Set(), // Will be handled by custom logic
        useInsertRows: true,
        customLogic: async function (self: InsertDataCommand, input: { teamsFullData: { name: string, league: string, stadium: string }[], filesTeams: Set<string> }) {
            const { teamsFullData, filesTeams } = input;
            const { dataToinsert: unsavedTeams } = await getExistingValues({
                table: 'teams',
                column: 'name',
                localData: filesTeams,
                dbConnection: self.getDbConnection()
            });

            insertRows({
                dataInserted: "teams",
                queriesColumns: 'INSERT INTO teams (team_id, name, country_id, stadium_id) VALUES ',
                queryValues: teamsFullData.filter(team => unsavedTeams.has(team.name))
                    .map(team => `(UUID_TO_BIN('${randomUUID()}'),
                    '${team.name.replaceAll("'", "''")}',
                    (SELECT country_id FROM competitions WHERE LOWER(league_name) = LOWER('${team.league}')),
                    (SELECT stadium_id FROM stadiums WHERE LOWER(stadium) = LOWER('${team.stadium}'))
                    )`),
                dbConnection: self.getDbConnection()
            });
        }
    },
    players: {
        table: 'players',
        column: 'name',
        dataInserted: 'players',
        queriesColumns: 'INSERT INTO players (player_id, name, country_id, team_id) VALUES ',
        generateQueryValues: () => [], // Will be handled by custom logic
        getLocalData: () => new Set(), // Will be handled by custom logic
        useInsertRows: true,
        customLogic: async function (self: InsertDataCommand, input: { playersFullData: { name: string, team: string, country: string }[], filesPlayers: Set<string> }) {
            const { playersFullData, filesPlayers } = input;
            const { dataToinsert: unsavedPlayers } = await getExistingValues({
                table: 'players',
                column: 'name',
                localData: filesPlayers,
                dbConnection: self.getDbConnection()
            });

            await insertRows({
                dataInserted: "players",
                queriesColumns: 'INSERT INTO players (player_id, name, country_id, team_id) VALUES ',
                queryValues: playersFullData.filter(player => unsavedPlayers.has(player.name))
                    .map(player => `(UUID_TO_BIN('${randomUUID()}'),
                    '${player.name.replaceAll("'", "''")}',
                    (SELECT country_id FROM countries WHERE LOWER(country) = LOWER('${player.country}')),
                    (SELECT team_id FROM teams WHERE LOWER(name) = LOWER('${player.team}'))
                    )`),
                dbConnection: self.getDbConnection()
            });
        }
    },
    playersPositions: {
        table: 'player_positions',
        column: 'name', // This will be handled in custom logic
        dataInserted: 'player_positions',
        queriesColumns: 'INSERT INTO player_positions (player_id, position_id) VALUES ',
        generateQueryValues: () => [], // Will be handled by custom logic
        getLocalData: () => new Set(), // Will be handled by custom logic
        useInsertRows: true,
        customLogic: async function (self: InsertDataCommand, input: { filesPlayersPosition: Set<string>, playersPositionFullData: { player: string, position: string, team: string }[] }) {
            const { filesPlayersPosition, playersPositionFullData } = input;

            const [rows] = await self.getDbConnection().query(`
                SELECT name, position FROM player_positions AS pp
                INNER JOIN players AS p ON p.player_id = pp.player_id
                INNER JOIN positions AS ps ON ps.position_id = pp.position_id;`);

            //@ts-ignore
            const existingData = new Set(rows.map((row: any) => `${row.name}_$$_${row.position}`));
            const unsavedPlayersPositions = new Set(Array.from(filesPlayersPosition).filter(pos => !existingData.has(pos)));

            insertRows({
                dataInserted: "player_positions",
                queriesColumns: 'INSERT INTO player_positions (player_id, position_id) VALUES ',
                queryValues: playersPositionFullData.filter(({ player, position }) => {
                    return unsavedPlayersPositions.has(`${player}_$$_${position}`);
                }).map(({ player, position, team }) => `(
                    (SELECT p.player_id FROM players AS p
                        INNER JOIN teams AS t ON t.team_id = p.team_id
                        WHERE LOWER(t.name) = LOWER('${team.replaceAll("'", "''")}')
                        AND LOWER(p.name) = LOWER('${player.replaceAll("'", "''")}')),
                    (SELECT position_id FROM positions
                        WHERE LOWER(position) = LOWER('${position}'))
                )`),
                dbConnection: self.getDbConnection()
            });
        }
    }
};