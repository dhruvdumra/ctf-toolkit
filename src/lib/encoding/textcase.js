export const reverse = (s) => [...s].reverse().join('')

export const reverseWords = (s) => s.split(/(\s+)/).map((w) => (/\s/.test(w) ? w : [...w].reverse().join(''))).join('')

const LEET = { a: '4', b: '8', e: '3', g: '9', i: '1', l: '1', o: '0', s: '5', t: '7', z: '2' }
const LEET_REV = { 4: 'a', 8: 'b', 3: 'e', 9: 'g', 1: 'i', 0: 'o', 5: 's', 7: 't', 2: 'z' }

export const leetEncode = (s) => [...s].map((c) => LEET[c.toLowerCase()] ?? c).join('')
export const leetDecode = (s) => [...s].map((c) => LEET_REV[c] ?? c).join('')

export const upperCase = (s) => s.toUpperCase()
export const lowerCase = (s) => s.toLowerCase()
export const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase())
export const toggleCase = (s) =>
  [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('')
export const stripWhitespace = (s) => s.replace(/\s+/g, '')

export const camelToSnake = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
export const snakeToCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
