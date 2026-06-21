const rotAlpha = (s, n) =>
  s.replace(/[a-z]/gi, (c) => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + n) % 26 + 26) % 26 + base)
  })

const rotDigits = (s, n) =>
  s.replace(/[0-9]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 48 + n) % 10 + 10) % 10 + 48))

export const rot13 = (s) => rotAlpha(s, 13)
export const rot5 = (s) => rotDigits(s, 5)
export const rot18 = (s) => rotDigits(rotAlpha(s, 13), 5)

export const rot47 = (s) =>
  [...s].map((ch) => {
    const c = ch.charCodeAt(0)
    return c >= 33 && c <= 126 ? String.fromCharCode(33 + ((c - 33 + 47) % 94)) : ch
  }).join('')

export const rotN = (s, n) => rotAlpha(s, ((n % 26) + 26) % 26)

export function rotBrute(s) {
  const out = []
  for (let n = 1; n < 26; n++) out.push({ shift: n, text: rotAlpha(s, n) })
  return out
}
