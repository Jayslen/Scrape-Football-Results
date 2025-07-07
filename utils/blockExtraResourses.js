export async function blockExtraResources (page) {
  await page.route('**/*', (route) => {
    const blocked = ['image', 'font']
    if (blocked.includes(route.request().resourceType())) {
      route.abort()
    } else {
      route.continue()
    }
  })
}
