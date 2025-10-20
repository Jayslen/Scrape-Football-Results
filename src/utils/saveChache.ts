import fs from 'node:fs/promises'
import path from 'node:path'

export async function saveCacheData(input: { fileName: string; data: any }) {
  const { fileName, data } = input
  const cacheFilePath = path.join(process.cwd(), 'cache', fileName)
  await fs.mkdir(path.dirname(cacheFilePath), { recursive: true })

  await fs.writeFile(cacheFilePath, JSON.stringify(data, null, 2), 'utf-8')
}
