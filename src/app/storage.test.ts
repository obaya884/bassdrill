import { describe, it, expect, beforeEach } from 'vitest'
import { loadStored, saveStored, STORAGE_KEY } from './storage'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('壊れた JSON・別の日付は既定値に戻す', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadStored('2026-11-05')).toEqual({ date: '2026-11-05', keyOffset: 0, manualKey: null })
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: '2026-11-04', keyOffset: 3, manualKey: 'E♭' }))
    expect(loadStored('2026-11-05')).toEqual({ date: '2026-11-05', keyOffset: 0, manualKey: null })
  })
  it('同じ日付ならそのまま返す', () => {
    const s = { date: '2026-11-05', keyOffset: 3, manualKey: 'E♭' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    expect(loadStored('2026-11-05')).toEqual(s)
  })
  it('無ければ既定値', () => {
    expect(loadStored('2026-11-05')).toEqual({ date: '2026-11-05', keyOffset: 0, manualKey: null })
  })
  it('saveStored は書き、loadStored で読める', () => {
    saveStored({ date: '2026-11-05', keyOffset: 2, manualKey: null })
    expect(loadStored('2026-11-05')).toEqual({ date: '2026-11-05', keyOffset: 2, manualKey: null })
  })
  it('古い intervalSec などの未知のフィールドが残っていても無視して読める（F-505）', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ intervalSec: 8, date: '2026-11-05', keyOffset: 4, manualKey: null, extra: true }))
    expect(loadStored('2026-11-05')).toEqual({ date: '2026-11-05', keyOffset: 4, manualKey: null })
  })
  it('範囲外の keyOffset は 0 に戻す', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: '2026-11-05', keyOffset: 99, manualKey: null }))
    expect(loadStored('2026-11-05').keyOffset).toBe(0)
  })
})
