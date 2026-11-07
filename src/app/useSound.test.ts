import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSound } from './useSound'
import { FADE } from './audioPlayer'
import { fakeAudioContext } from '../test/fakeAudio'

const steps = [{ midis: [40], seconds: 0.3 }]

describe('useSound', () => {
  it('初期は切で、play しても何も作らない', () => {
    const ctx = fakeAudioContext()
    const createContext = vi.fn(() => ctx)
    const { result } = renderHook(() => useSound({ createContext }))
    expect(result.current.enabled).toBe(false)
    act(() => result.current.play(steps))
    expect(createContext).not.toHaveBeenCalled()
    expect(ctx.oscs).toHaveLength(0)
  })
  it('toggle で入になり、そのとき createContext を 1 回だけ呼んで resume する。切→入を繰り返しても作り直さない', () => {
    const ctx = fakeAudioContext()
    const createContext = vi.fn(() => ctx)
    const { result } = renderHook(() => useSound({ createContext }))
    act(() => result.current.toggle())
    expect(result.current.enabled).toBe(true)
    expect(createContext).toHaveBeenCalledTimes(1)
    expect(ctx.resume).toHaveBeenCalledTimes(1)
    act(() => result.current.toggle())
    act(() => result.current.toggle())
    expect(result.current.enabled).toBe(true)
    expect(createContext).toHaveBeenCalledTimes(1)
    expect(ctx.resume).toHaveBeenCalledTimes(2)
  })
  it('入のとき play は段取りを鳴らし、切に戻すと止まる', () => {
    const ctx = fakeAudioContext(5)
    const { result } = renderHook(() => useSound({ createContext: () => ctx }))
    act(() => result.current.toggle())
    act(() => result.current.play(steps))
    expect(ctx.oscs).toHaveLength(1)
    expect(ctx.oscs[0].start).toHaveBeenCalledWith(5)
    ctx.currentTime = 5.1
    act(() => result.current.toggle())
    expect(result.current.enabled).toBe(false)
    expect(ctx.oscs[0].stop).toHaveBeenLastCalledWith(5.1 + FADE) // 10ms で音量を落としてから止める
    act(() => result.current.play(steps))
    expect(ctx.oscs).toHaveLength(1)
  })
  it('createContext が null を返す環境では入にしても落ちず、play は何もしない', () => {
    const { result } = renderHook(() => useSound({ createContext: () => null }))
    act(() => result.current.toggle())
    expect(result.current.enabled).toBe(true)
    act(() => result.current.play(steps))
  })
  it('createContext を省くと window.AudioContext が無い jsdom では null 扱いで落ちない', () => {
    const { result } = renderHook(() => useSound())
    act(() => result.current.toggle())
    expect(result.current.enabled).toBe(true)
    act(() => result.current.play(steps))
  })
})
