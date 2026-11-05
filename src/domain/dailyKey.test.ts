import { describe, it, expect } from 'vitest'
import { formatNote } from './pitch'
import { dayNumber, mulberry32, blockPermutation, keyForDay } from './dailyKey'

describe('dailyKey', () => {
  it('dayNumber は Asia/Tokyo の暦日で数える', () => {
    expect(dayNumber(new Date('2026-11-05T00:00:00+09:00'))).toBe(20762)
    expect(dayNumber(new Date('2026-11-05T15:30:00Z'))).toBe(20763) // JST では 11/6 0:30
    expect(dayNumber(new Date('2026-11-05T14:59:59Z'))).toBe(20762)
    expect(dayNumber(new Date('1970-01-01T00:00:00Z'), 'UTC')).toBe(0)
  })
  it('mulberry32 は 0 以上 1 未満で決定的', () => {
    const a = mulberry32(42), b = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const x = a()
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
      expect(b()).toBe(x)
    }
  })
  it('ブロック順列は 12 キーの並べ替えで、同じ block なら同じ', () => {
    const p = blockPermutation(1730)
    expect(new Set(p.map(formatNote)).size).toBe(12)
    expect(blockPermutation(1730)).toEqual(p)
  })
  it('ブロックの境目で同じキーが 2 日続かない（block 0〜2000 を総当たり）', () => {
    for (let b = 1; b <= 2000; b++) {
      expect(formatNote(blockPermutation(b)[0])).not.toBe(formatNote(blockPermutation(b - 1)[11]))
    }
  })
  it('連続する日で同じキーが出ない・12 日で全キーが出る', () => {
    for (let d = 20000; d < 20000 + 365; d++) {
      expect(formatNote(keyForDay(d))).not.toBe(formatNote(keyForDay(d + 1)))
    }
    const twelve = new Set(Array.from({ length: 12 }, (_, i) => formatNote(keyForDay(20760 + i)))) // 20760 = 1730*12
    expect(twelve.size).toBe(12)
  })
  it('offset 1 は明日のキー、offset 12 は今日に戻る', () => {
    expect(keyForDay(20762, 1)).toEqual(keyForDay(20763))
    expect(keyForDay(20762, 12)).toEqual(keyForDay(20762))
  })
})
