# Project description

Scrape Football Results is a command-line application built with Node.js that allows users to effortlessly fetch football match results and team data from their favorite leagues using web scrapping. With a single command, the app retrieves information from [Fotmob](https://www.fotmob.com/) and automatically saves it in a structured JSON file for easy access and further processing.

>[!important]
> Node version 22.12.0
>
> Typescript version 5.8.3

> [!important]
> I will be uploading a scrip to create the dababase for you
> to interact to all the commands that have something to do with load data to a db, once the project is done.
>

> [!NOTE]
> Currently, only La Liga, Premier League, Seria A and Bundesliga are supported.
>
> When specifying a league as an argument, use the following formats:
> 
> - premier-league
> - laliga
> - serie (serie A)
> - bundesliga

## Tech Stack
- NodeJS
- TypeScript
- CommanderJS
- Playwright
- Zod

## Commands
`sfr`: Main command

`sfr round <league> <season>`

Fetches round information for a specific league and season.

``
sfr round <league> <season> [options]
``

**Arguments**:
- league: The league name.
  - premier-league
  - laliga
- season: The season
  - 2023-2024.
  - 2024-2025.
  - etc.....
 
**Options**:
```
-r, --round <number>: Fetch data for a specific round only.
-f, --from <number>: Define the starting round number.
-t, --to <number>: Define the ending round number.
```

`sfr teams <league>`

Fetches the list of teams for a given league.

**Arguments**:
- league: The league name.
  - premier-league
  - laliga

`sfr update-db-teams`

Process all the data scraped by the teams command and save it to a MySQL database.

## Installation

Install with npm

```bash
  git clone https://github.com/Jayslen/Scrape-Football-Results.git
  npm install
  npm run build
```
With this the progrom should run with the command `sfr` in the Command line

### Development
Run this code to compile the js code
```bash
npm run build
```
To run the typescript code withou compile it 
```bash
  npx tsx ./src/index.ts [command] [opntions]
```
or:
```bash
  npm run dev [command] [options]
```
