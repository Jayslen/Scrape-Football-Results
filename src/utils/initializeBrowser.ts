import { chromium } from 'playwright'
import { blockExtraResources } from './blockExtraResourses.js'

export async function initializeBrowser() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  await blockExtraResources(context)
  const page = await context.newPage()
  return { browser, page }
}
