// @ts-nocheck

import { randomUUID } from "node:crypto";
import { insertAll, insertRows, getExistingValues } from '../../db/dbStatements.js';
import { LEAGUES_AVAILABLE, INSERTION_CONFIGS } from '../../config.js'
import { Connection } from "@customTypes/db";
import { Stadium } from "@customTypes/teams";

export class InsertDataCommand {
    private dbConnection: Connection;
    constructor(dbConnection: Connection) {
        this.dbConnection = dbConnection;
    }

    private async executeInsertion(configKey: string, data?: any) {
        const config = INSERTION_CONFIGS[configKey];
        if (!config) {
            throw new Error(`Configuration not found for: ${configKey}`);
        }

        // Handle custom logic
        if (config.customLogic) {
            await config.customLogic(this, data);
            return;
        }

        if (config.useInsertAll) {
            await insertAll({
                queries: {
                    queriesColumns: config.queriesColumns,
                    queryValues: config.generateQueryValues(data),
                    dataInserted: config.dataInserted
                },
                retriveData: {
                    table: config.table,
                    column: config.column,
                    localData: config.getLocalData(data)
                },
                dbConnection: this.dbConnection
            });
        }
    }

    public getDbConnection(): Connection {
        return this.dbConnection;
    }

    async insertLeagues() {
        await this.executeInsertion('leagues');
    }

    async insertCountries(countries: Set<string>) {
        await this.executeInsertion('countries', countries);
    }

    async insertPositions(positions: Set<string>) {
        await this.executeInsertion('positions', positions);
    }

    async insertStadiums(input: { filesStadiums: Set<string>, stadiumsFullData: Stadium[] }) {
        await this.executeInsertion('stadiums', input);
    }

    async insertTeams(input: { teamsFullData: { name: string, league: string, stadium: string }[], filesTeams: Set<string> }) {
        await this.executeInsertion('teams', input);
    }

    async insertPlayers(input: { playersFullData: { name: string, team: string, country: string }[], filesPlayers: Set<string> }) {
        await this.executeInsertion('players', input);
    }

    async insertPlayersPositions(input: { filesPlayersPosition: Set<string>, playersPositionFullData: { player: string, position: string, team: string }[] }) {
        await this.executeInsertion('playersPositions', input);
    }

    // Execute all insertions in proper dependency order
    async executeAllInsertions(data: {
        countries?: Set<string>;
        positions?: Set<string>;
        stadiums?: { filesStadiums: Set<string>, stadiumsFullData: Stadium[] };
        teams?: { teamsFullData: { name: string, league: string, stadium: string }[], filesTeams: Set<string> };
        players?: { playersFullData: { name: string, team: string, country: string }[], filesPlayers: Set<string> };
        playersPositions?: { filesPlayersPosition: Set<string>, playersPositionFullData: { player: string, position: string, team: string }[] };
        includeLeagues?: boolean;
    }) {
        const {
            countries,
            positions,
            stadiums,
            teams,
            players,
            playersPositions,
            includeLeagues = true
        } = data;

        // Execute in dependency order
        if (countries) {
            await this.insertCountries(countries);
        }

        if (includeLeagues) {
            await this.insertLeagues();
        }

        if (positions) {
            await this.insertPositions(positions);
        }

        if (stadiums) {
            await this.insertStadiums(stadiums);
        }

        if (teams) {
            await this.insertTeams(teams);
        }

        if (players) {
            await this.insertPlayers(players);
        }

        if (playersPositions) {
            await this.insertPlayersPositions(playersPositions);
        }

        this.dbConnection.end()
    }

    // Execute multiple basic insertions in sequence
    async executeBasicInsertions(data: {
        countries?: Set<string>;
        positions?: Set<string>;
        includeLeagues?: boolean;
    }) {
        const { countries, positions, includeLeagues = true } = data;

        if (includeLeagues) {
            await this.insertLeagues();
        }

        if (countries) {
            await this.insertCountries(countries);
        }

        if (positions) {
            await this.insertPositions(positions);
        }
    }


    // Get available insertion types
    getAvailableInsertionTypes(): string[] {
        return Object.keys(INSERTION_CONFIGS);
    }

    // Execute specific insertions by name
    async executeInsertionsByName(insertions: { name: string, data?: any }[]) {
        for (const insertion of insertions) {
            await this.executeInsertion(insertion.name, insertion.data);
        }
    }
}