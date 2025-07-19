import { PageInstance } from '@customTypes/global'

export async function blockExtraResources(page: PageInstance) {
  await page.route('**/*', (route) => {
    const blocked = ['image', 'font']
    if (blocked.includes(route.request().resourceType())) {
      route.abort()
    } else {
      route.continue()
    }
  })
}
