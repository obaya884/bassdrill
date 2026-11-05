import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { note } from '../domain/pitch'
import { majorScale } from '../domain/scale'
import { mulberry32 } from '../domain/dailyKey'
import { useQuizRunner } from './useQuizRunner'

const C = majorScale(note('C'))

describe('useQuizRunner', () => {
  it('advance で asking → answered → 次の問題', () => {
    const { result } = renderHook(() => useQuizRunner({ scale: C, rng: mulberry32(1) }))
    const q1 = result.current.question
    expect(result.current.phase).toBe('asking')
    act(() => result.current.advance())
    expect(result.current.phase).toBe('answered')
    expect(result.current.question).toEqual(q1)
    act(() => result.current.advance())
    expect(result.current.phase).toBe('asking')
    expect(result.current.question).not.toEqual(q1)
  })
  it('scale が変わったら新しい問題から始める', () => {
    const props = { scale: C, rng: mulberry32(9) }
    const { result, rerender } = renderHook((p: typeof props) => useQuizRunner(p), { initialProps: props })
    act(() => result.current.advance())
    expect(result.current.phase).toBe('answered')
    rerender({ ...props, scale: majorScale(note('G')) })
    expect(result.current.phase).toBe('asking')
  })
})
