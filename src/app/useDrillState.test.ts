import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDrillState } from './useDrillState'
import { STORAGE_KEY } from './storage'
import { SECTIONS } from './sections'

const NOW = new Date('2026-11-05T09:00:00+09:00')

describe('useDrillState', () => {
  beforeEach(() => localStorage.clear())

  it('節は 6 つで、初期の節はスケール', () => {
    expect(SECTIONS).toEqual(['scale', 'penta', 'seventh', 'quiz', 'diatonic', 'nonDiatonic'])
    const { result } = renderHook(() => useDrillState({ now: NOW }))
    expect(result.current.focus).toBe('scale')
  })
  it('selectChord は節と添字を直接選び、範囲外は挟む', () => {
    const { result } = renderHook(() => useDrillState({ now: NOW }))
    act(() => result.current.selectChord('diatonic', 5))
    expect(result.current.chordIndex.diatonic).toBe(5)
    act(() => result.current.selectChord('seventh', 9))
    expect(result.current.chordIndex.seventh).toBe(3)
  })
  it('nextKey と selectKey で節は動かず、コード選択は先頭に戻る', () => {
    const { result } = renderHook(() => useDrillState({ now: NOW }))
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
  it('moveFocus は端で止まる', () => {
    const { result } = renderHook(() => useDrillState({ now: NOW }))
    act(() => result.current.moveFocus(-1))
    expect(result.current.focus).toBe('scale')
    for (let i = 0; i < 10; i++) act(() => result.current.moveFocus(1))
    expect(result.current.focus).toBe('nonDiatonic')
  })
  it('古い intervalSec を持つ保存でも起動する', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ intervalSec: 8, date: '2026-11-05', keyOffset: 2, manualKey: null }))
    const { result } = renderHook(() => useDrillState({ now: NOW }))
    expect(result.current.keyOffset).toBe(2)
  })
})
