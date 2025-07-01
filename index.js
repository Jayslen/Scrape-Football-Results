#!/usr/bin/env node

import { program } from 'commander'
import { Commands } from './commands'

program
  .name('Scrapping results')
  .version('1.0.0')
  .description('A CLI application for scrapping data for footmob ')
  .option('-s, --show-window', 'Show browser windows while scrapping data')

// const options = program.opts()

program.parse()
