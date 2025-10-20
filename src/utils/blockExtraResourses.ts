import { Page, BrowserContext } from 'playwright'

export async function blockExtraResources(target: Page | BrowserContext) {
  await target.route('**/*', (route) => {
    const blocked = ['image', 'font', 'media']
    if (blocked.includes(route.request().resourceType())) {
      route.abort()
    } else {
      route.continue()
    }
  })
}
