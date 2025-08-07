import fs from 'node:fs/promises'
import path, { parse } from 'node:path'
import { saveCacheData } from '../utils/saveChache.js'
import { CacheTeamsFiles, FilesData } from '@customTypes/fs/teams'
import { Stadium, Teams } from '@customTypes/teams'

const { root } = parse(process.cwd())

const teamsDirectory = path.join(root, 'football-stats', 'teams')
const cachePath = path.join(process.cwd(), 'cache', 'teams.json');

const filesData: FilesData = {
    filesCountries: new Set<string>(),
    filesPositions: new Set<string>(),
    filesStadiums: new Set<string>(),
    stadiumsData: [],
    filesTeams: new Set<string>(),
    filesTeamsData: [],
    filesPlayers: new Set<string>(),
    playersData: [],
    filesPlayersPosition: new Set<string>(),
    playersPositionFullData: []
}

export async function getTeamsDataFiles(): Promise<FilesData> {
    try {
        const teamsStat = await fs.stat(teamsDirectory)
        const cacheStat = await fs.stat(cachePath)

        const isCacheUpToDate = teamsStat.mtime < cacheStat.mtime;

        if (isCacheUpToDate) {
            const cacheData = JSON.parse(await fs.readFile(cachePath, 'utf-8')) as CacheTeamsFiles
            filesData.filesCountries = new Set(cacheData.filesCountries);
            filesData.filesPositions = new Set(cacheData.filesPositions);
            filesData.filesStadiums = new Set(cacheData.filesStadiums);
            filesData.stadiumsData = cacheData.stadiumsData;
            filesData.filesTeams = new Set(cacheData.filesTeams);
            filesData.filesTeamsData = cacheData.filesTeamsData;
            filesData.filesPlayers = new Set(cacheData.filesPlayers);
            filesData.playersData = cacheData.playersData;
            filesData.filesPlayersPosition = new Set(cacheData.filesPlayersPosition);
            filesData.playersPositionFullData = cacheData.playersPositionFullData;
            return { ...filesData };
        }

    } catch (error) {
        if ((error as any).code === 'ENOENT') {
            if ((error as any).path === teamsDirectory) {
                console.log(`Teams directory not found at: ${teamsDirectory}. Please ensure the directory exists.`)
                process.exit(1)
            }
        }
    }

    const teamsFile = await fs.readdir(teamsDirectory)
    const { filesCountries, filesPlayers
        , filesPositions, filesStadiums, stadiumsData, filesTeams, filesTeamsData, playersData, filesPlayersPosition, playersPositionFullData
    } = filesData
    for (const file of teamsFile) {
        const filePath = path.join(teamsDirectory, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const teamsData: Teams = JSON.parse(data)

        // countries data
        const countries = teamsData.teams.flatMap(team => team.players.map(player => player.country))
        countries.forEach(country => filesCountries.add(country))

        // positions data
        const positions = teamsData.teams.flatMap(team => team.players.flatMap(player => player.positions))
        positions.forEach(position => filesPositions.add(position))

        // stadiums data
        const stadiums: Stadium[] = teamsData.teams.map((stadium) => {
            return {
                ...stadium.stadium,
                name: stadium.stadium.name,
            }
        })
        stadiums.forEach(stadium => filesStadiums.add(stadium.name))
        stadiumsData.push(...stadiums)

        // teams data
        const teams = teamsData.teams.map((team) => {
            return {
                name: team.teamName,
                league: teamsData.league,
                stadium: team.stadium.name.replaceAll("'", "''")
            }
        })
        teams.forEach(team => filesTeams.add(team.name))
        filesTeamsData.push(...teams)

        // players data
        const players = teamsData.teams.flatMap(team => team.players.map(player => ({
            name: player.name,
            country: player.country,
            team: team.teamName
        })))
        players.forEach(player => filesPlayers.add(player.name))
        playersData.push(...players)

        // players positions data
        const playerPositions = teamsData.teams.flatMap((team) => {
            return team.players.flatMap((player) => {
                return player.positions.map((position) => `${player.name}_$$_${position}_$$_${team.teamName}`)
            })
        })

        playerPositions.forEach(position => {
            const [player, positionName, team] = position.split('_$$_')
            filesPlayersPosition.add(`${player}_$$_${positionName}`)
            playersPositionFullData.push({ player, position: positionName, team })
        })
    }

    saveCacheData({
        fileName: 'teams.json',
        data: {
            filesCountries: Array.from(filesCountries),
            filesPositions: Array.from(filesPositions),
            filesStadiums: Array.from(filesStadiums),
            stadiumsData,
            filesTeams: Array.from(filesTeams),
            filesTeamsData: Array.from(filesTeamsData),
            filesPlayers: Array.from(filesPlayers),
            playersData,
            filesPlayersPosition: Array.from(filesPlayersPosition),
            playersPositionFullData
        } as CacheTeamsFiles
    })

    return { ...filesData }
}