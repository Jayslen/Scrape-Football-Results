import { InsertDataCommand } from "src/commands/teams-insertion/insertionCommands.js";
import { Stadium } from "../teams.js";

export interface InsertionConfig {
    table: string;
    column: string;
    dataInserted: string;
    queriesColumns: string;
    generateQueryValues: (data: any) => string[];
    getLocalData: (data: any) => Set<string>;
    useInsertAll?: boolean;
    useInsertRows?: boolean;
    customLogic?: (self: InsertDataCommand, data: any) => Promise<void>;
}

export interface FilesData {
    filesCountries: Set<string>;
    filesPositions: Set<string>;
    filesStadiums: Set<string>;
    stadiumsData: Stadium[];
    filesTeams: Set<string>;
    filesTeamsData: { name: string; league: string; stadium: string }[];
    filesPlayers: Set<string>;
    playersData: { name: string; country: string; team: string }[];
    filesPlayersPosition: Set<string>;
    playersPositionFullData: { player: string; position: string; team: string }[];
}


export interface CacheTeamsFiles {
    filesCountries: string[];
    filesPositions: Position[];
    filesStadiums: string[];
    stadiumsData: StadiumsDatum[];
    filesTeams: string[];
    filesTeamsData: FilesTeamsDatum[];
    filesPlayers: string[];
    playersData: PlayersDatum[];
    filesPlayersPosition: string[];
    playersPositionFullData: PlayersPositionFullDatum[];
}

export enum Position {
    Am = "AM",
    Attacker = "Attacker",
    CM = "CM",
    Cb = "CB",
    Coach = "Coach",
    Defender = "Defender",
    Dm = "DM",
    Gk = "GK",
    LB = "LB",
    LM = "LM",
    Lw = "LW",
    Lwb = "LWB",
    Midfielder = "Midfielder",
    Rb = "RB",
    Rm = "RM",
    Rw = "RW",
    Rwb = "RWB",
    St = "ST",
}

export interface FilesTeamsDatum {
    name: string;
    league: League;
    stadium: string;
}

export enum League {
    Bundesliga = "Bundesliga",
    LaLiga = "La Liga",
    PremierLeague = "Premier League",
    SerieA = "Serie A",
}

export interface PlayersDatum {
    name: string;
    country: string;
    team: string;
}

export interface PlayersPositionFullDatum {
    player: string;
    position: Position;
    team: string;
}

export interface StadiumsDatum {
    name: string;
    capacity: string;
    yearOpened: string;
    surface: Surface;
}

export enum Surface {
    Grass = "Grass",
}