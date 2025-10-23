import { Page, BrowserContext } from 'playwright'

export async function blockExtraResources(target: Page | BrowserContext) {
  await target.route('**/*', (route) => {
    const blockedTypes = new Set(['font', 'media'])

    if (blockedTypes.has(route.request().resourceType())) {
      route.abort()
    } else {
      route.continue()
    }
  })
}
