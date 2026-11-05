import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { note } from '../domain/pitch'
import { majorScale } from '../domain/scale'
import { mulberry32 } from '../domain/dailyKey'
import { useQuizRunner } from './useQuizRunner'

const C = majorScale(note('C'))

describe('useQuizRunner', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('advance で asking → answered → 次の問題', () => {
    const { result } = renderHook(() => useQuizRunner({ scale: C, active: true, auto: false, intervalSec: 5, rng: mulberry32(1) }))
    const q1 = result.current.question
    expect(result.current.phase).toBe('asking')
    act(() => result.current.advance())
    expect(result.current.phase).toBe('answered')
    expect(result.current.question).toEqual(q1)
    act(() => result.current.advance())
    expect(result.current.phase).toBe('asking')
    expect(result.current.question).not.toEqual(q1)
  })
  it('auto なら intervalSec ごとに進み、active を外すと止まる', () => {
    const props = { scale: C, active: true, auto: true, intervalSec: 3, rng: mulberry32(2) }
    const { result, rerender } = renderHook((p: typeof props) => useQuizRunner(p), { initialProps: props })
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.phase).toBe('answered')
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.phase).toBe('asking')
    rerender({ ...props, active: false })
    act(() => vi.advanceTimersByTime(10000))
    expect(result.current.phase).toBe('asking')
  })
  it('手で advance したらタイマーは次の状態から数え直す', () => {
    const props = { scale: C, active: true, auto: true, intervalSec: 4, rng: mulberry32(5) }
    const { result } = renderHook(() => useQuizRunner(props))
    act(() => vi.advanceTimersByTime(3000))
    act(() => result.current.advance())
    expect(result.current.phase).toBe('answered')
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.phase).toBe('answered') // まだ 4 秒経っていない
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.phase).toBe('asking')
  })
  it('scale が変わったら新しい問題から始める', () => {
    const props = { scale: C, active: true, auto: false, intervalSec: 5, rng: mulberry32(9) }
    const { result, rerender } = renderHook((p: typeof props) => useQuizRunner(p), { initialProps: props })
    act(() => result.current.advance())
    expect(result.current.phase).toBe('answered')
    rerender({ ...props, scale: majorScale(note('G')) })
    expect(result.current.phase).toBe('asking')
  })
})
