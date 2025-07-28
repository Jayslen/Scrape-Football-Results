import { chromium } from "playwright";
import { blockExtraResources } from "./blockExtraResourses.js";

export async function initializeBrowser() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    blockExtraResources(page);
    return { browser, page };
}