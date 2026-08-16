import { describe, expect, it } from 'vitest'

import en from './en'
import ru from './ru'
import zhcn from './zhcn'

// Project convention (see CLAUDE.md / redesign notes): en is the source of truth
// and ru is the second fully-maintained locale; fa/vi/zhcn/zhtw intentionally fall
// back to en for newer keys (fallbackLocale='en'). So we enforce en<->ru parity
// only - this catches a translation added to one but forgotten in the other (which
// would surface as an unexpected English string in RU).
const flatten = (
  obj: Record<string, unknown>,
  prefix = '',
  out: Record<string, unknown> = {},
): Record<string, unknown> => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v as Record<string, unknown>, key, out)
    } else {
      out[key] = v
    }
  }
  return out
}

const placeholders = (value: unknown): string[] =>
  typeof value === 'string' ? (value.match(/\{[^{}]+\}/g) ?? []).sort() : []

describe('en/ru locale key parity', () => {
  const enKeys = new Set(Object.keys(flatten(en as Record<string, unknown>)))
  const ruKeys = new Set(Object.keys(flatten(ru as Record<string, unknown>)))

  it('ru defines every key en defines', () => {
    const missing = [...enKeys].filter((k) => !ruKeys.has(k)).sort()
    expect(missing, `keys in en but missing from ru: ${missing.join(', ')}`).toEqual([])
  })

  it('ru does not define keys absent from en', () => {
    const extra = [...ruKeys].filter((k) => !enKeys.has(k)).sort()
    expect(extra, `keys in ru but missing from en: ${extra.join(', ')}`).toEqual([])
  })
})

describe('en/zhHans locale key parity', () => {
  const enMessages = flatten(en as Record<string, unknown>)
  const zhMessages = flatten(zhcn as Record<string, unknown>)
  const enKeys = new Set(Object.keys(enMessages))
  const zhKeys = new Set(Object.keys(zhMessages))

  it('defines every key en defines', () => {
    const missing = [...enKeys].filter((k) => !zhKeys.has(k)).sort()
    expect(missing, `keys in en but missing from zhHans: ${missing.join(', ')}`).toEqual([])
  })

  it('does not define keys absent from en', () => {
    const extra = [...zhKeys].filter((k) => !enKeys.has(k)).sort()
    expect(extra, `keys in zhHans but missing from en: ${extra.join(', ')}`).toEqual([])
  })

  it('does not contain empty translations', () => {
    const empty = Object.entries(zhMessages)
      .filter(([, value]) => typeof value === 'string' && value.trim() === '')
      .map(([key]) => key)
      .sort()
    expect(empty, `empty translations in zhHans: ${empty.join(', ')}`).toEqual([])
  })

  it('preserves interpolation placeholders', () => {
    const mismatched = [...zhKeys]
      .filter((key) => enKeys.has(key))
      .filter(
        (key) => JSON.stringify(placeholders(enMessages[key])) !== JSON.stringify(placeholders(zhMessages[key])),
      )
      .sort()
    expect(mismatched, `placeholder mismatches in zhHans: ${mismatched.join(', ')}`).toEqual([])
  })
})
