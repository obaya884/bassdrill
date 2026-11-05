import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { note, formatNote } from '../domain/pitch'
import { KEYS } from '../domain/scale'
import { rouletteSequence, useKeyRoulette, STEPS } from './useKeyRoulette'
import { setReducedMotion } from '../test/viewport'

// 0, 1/12, 2/12, … を順に返す疑似乱数（KEYS の添字を順に選ぶ）
const seqRng = (start = 0) => {
  let i = start
  return () => (i++ % 12) / 12 + 0.001
}
const NAMES = KEYS.map(formatNote)

describe('rouletteSequence', () => {
  it('12 段階で、直前と同じキーは選ばず、最後は今日のキーと違う', () => {
    const seq = rouletteSequence(note('C'), seqRng(1))
    expect(seq).toHaveLength(STEPS)
    seq.forEach((k, i) => {
      expect(NAMES).toContain(formatNote(k))
      if (i > 0) expect(formatNote(k)).not.toBe(formatNote(seq[i - 1]))
    })
    expect(formatNote(seq[STEPS - 1])).not.toBe('C')
  })
  it('同じ値を返し続ける乱数でも止まらず、重なりを避ける', () => {
    let n = 0
    const rng = () => (n++ < 3 ? 0.001 : 0.5) // 最初は C ばかり
    const seq = rouletteSequence(note('C'), rng)
    expect(formatNote(seq[0])).toBe('C')
    expect(formatNote(seq[1])).not.toBe('C')
  })
})

describe('useKeyRoulette', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('回っている間は別のキーを見せ、約 0.8 秒で今日のキーに止まる', () => {
    setReducedMotion(false)
    const { result } = renderHook(() => useKeyRoulette({ today: note('C'), current: note('C'), trigger: '2026-11-05', rng: seqRng(1) }))
    expect(result.current).toBe('G') // 最初の段階
    act(() => { vi.advanceTimersByTime(50) })
    expect(result.current).toBe('D')
    act(() => { vi.advanceTimersByTime(650) })
    expect(result.current).not.toBe('C') // まだ回っている（合計 770ms）
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('C')
    act(() => { vi.advanceTimersByTime(5000) })
    expect(result.current).toBe('C')
  })
  it('prefers-reduced-motion なら回さずに今のキーを出す', () => {
    setReducedMotion(true)
    const { result } = renderHook(() => useKeyRoulette({ today: note('C'), current: note('C'), trigger: '2026-11-05', rng: seqRng(1) }))
    expect(result.current).toBe('C')
  })
  it('回っている間にキーが変わったら即座に今のキーを出す', () => {
    setReducedMotion(false)
    const { result, rerender } = renderHook(
      ({ current }) => useKeyRoulette({ today: note('C'), current, trigger: '2026-11-05', rng: seqRng(1) }),
      { initialProps: { current: note('C') } },
    )
    expect(result.current).toBe('G')
    rerender({ current: note('E', -1) })
    expect(result.current).toBe('E♭')
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current).toBe('E♭')
  })
  it('日付が変わる（trigger が変わる）と回し直す', () => {
    setReducedMotion(false)
    const { result, rerender } = renderHook(
      ({ trigger, today }) => useKeyRoulette({ today, current: today, trigger, rng: seqRng(1) }),
      { initialProps: { trigger: '2026-11-05', today: note('C') } },
    )
    act(() => { vi.advanceTimersByTime(2000) })
    expect(result.current).toBe('C')
    rerender({ trigger: '2026-11-06', today: note('F') })
    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current).not.toBe('F')
    act(() => { vi.advanceTimersByTime(2000) })
    expect(result.current).toBe('F')
  })
})
