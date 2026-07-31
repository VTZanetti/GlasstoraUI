/**
 * Whether a typed query matches any of the words an entry answers to.
 *
 * Case and accent insensitive, because a Portuguese label typed without its
 * accents is still what the user meant. Substring rather than prefix: a command
 * palette is searched by the middle of a phrase as often as by its start.
 */
export function matchesQuery(query: string, ...against: (string | undefined)[]): boolean {
  const needle = fold(query)
  if (!needle) return true
  return against.some((text) => text !== undefined && fold(text).includes(needle))
}

function fold(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}
