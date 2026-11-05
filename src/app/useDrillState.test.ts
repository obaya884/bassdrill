import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDrillState } from './useDrillState'

const NOW = new Date('2026-11-05T09:00:00+09:00')

describe('useDrillState', () => {
  beforeEach(() => localStorage.clear())

  it('selectChord は節と添字を直接選び、範囲外は挟む', () => {
    const { result } = renderHook(() => useDrillState({ now: NOW, mode: 'phone' }))
    act(() => result.current.selectChord('diatonic', 5))
    expect(result.current.chordIndex.diatonic).toBe(5)
    act(() => result.current.selectChord('seventh', 9))
    expect(result.current.chordIndex.seventh).toBe(3)
    act(() => result.current.selectChord('nonDiatonic', -2))
    expect(result.current.chordIndex.nonDiatonic).toBe(0)
  })
  it('setIntervalSec は 2〜15 に挟む', () => {
    const { result } = renderHook(() => useDrillState({ now: NOW, mode: 'phone' }))
    act(() => result.current.setIntervalSec(99))
    expect(result.current.intervalSec).toBe(15)
    act(() => result.current.setIntervalSec(0))
    expect(result.current.intervalSec).toBe(2)
    act(() => result.current.setIntervalSec(7))
    expect(result.current.intervalSec).toBe(7)
  })
  it("mode='phone' では nextKey と selectKey で節に留まり、コード選択は戻る", () => {
    const { result } = renderHook(() => useDrillState({ now: NOW, mode: 'phone' }))
    act(() => result.current.setFocus('nonDiatonic'))
    act(() => result.current.selectChord('nonDiatonic', 4))
    act(() => result.current.nextKey())
    expect(result.current.focus).toBe('nonDiatonic')
    expect(result.current.keyOffset).toBe(1)
    expect(result.current.chordIndex.nonDiatonic).toBe(0)
    act(() => result.current.selectKey(result.current.scale[3]))
    expect(result.current.focus).toBe('nonDiatonic')
    expect(result.current.manualKey).not.toBeNull()
  })
  it("mode='desktop' では nextKey と selectKey で節 1 へ戻る", () => {
    const { result } = renderHook(() => useDrillState({ now: NOW, mode: 'desktop' }))
    act(() => result.current.setFocus('nonDiatonic'))
    act(() => result.current.nextKey())
    expect(result.current.focus).toBe('key')
    act(() => result.current.setFocus('quiz'))
    act(() => result.current.selectKey(result.current.scale[3]))
    expect(result.current.focus).toBe('key')
  })
  it("mode='phone' では onAction('help') が helpOpen を変えない", () => {
    const { result } = renderHook(() => useDrillState({ now: NOW, mode: 'phone' }))
    act(() => result.current.onAction('help'))
    expect(result.current.helpOpen).toBe(false)
  })
  it("mode='desktop' では onAction('help') でヘルプが開く", () => {
    const { result } = renderHook(() => useDrillState({ now: NOW, mode: 'desktop' }))
    act(() => result.current.onAction('help'))
    expect(result.current.helpOpen).toBe(true)
  })
})
