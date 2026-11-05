import { describe, it, expect, beforeEach } from 'vitest'
import { loadStored, saveStored, STORAGE_KEY } from './storage'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('壊れた JSON・別の日付は既定値に戻し、intervalSec だけ引き継ぐ', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadStored('2026-11-05')).toEqual({ intervalSec: 5, date: '2026-11-05', keyOffset: 0, manualKey: null })
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ intervalSec: 8, date: '2026-11-04', keyOffset: 3, manualKey: 'E♭' }))
    expect(loadStored('2026-11-05')).toEqual({ intervalSec: 8, date: '2026-11-05', keyOffset: 0, manualKey: null })
  })
  it('同じ日付ならそのまま返す', () => {
    const s = { intervalSec: 8, date: '2026-11-05', keyOffset: 3, manualKey: 'E♭' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    expect(loadStored('2026-11-05')).toEqual(s)
  })
  it('無ければ既定値', () => {
    expect(loadStored('2026-11-05')).toEqual({ intervalSec: 5, date: '2026-11-05', keyOffset: 0, manualKey: null })
  })
  it('saveStored は書き、loadStored で読める', () => {
    saveStored({ intervalSec: 3, date: '2026-11-05', keyOffset: 2, manualKey: null })
    expect(loadStored('2026-11-05')).toEqual({ intervalSec: 3, date: '2026-11-05', keyOffset: 2, manualKey: null })
  })
})

describe('storage: intervalSec の範囲（F-404）', () => {
  beforeEach(() => localStorage.clear())
  it.each([0, -3, 2.5, 99, '7'])('%s は既定の 5 に戻す', (v) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ intervalSec: v, date: '2026-11-05', keyOffset: 0, manualKey: null }))
    expect(loadStored('2026-11-05').intervalSec).toBe(5)
  })
  it('2 と 15 はそのまま', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ intervalSec: 15, date: '2026-11-05', keyOffset: 0, manualKey: null }))
    expect(loadStored('2026-11-05').intervalSec).toBe(15)
  })
})
