export function scapeQuote(value: string): string {
  return value.replace(/'/g, "\\'")
}
