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

describe('useSound を入で開く（F-506。PC の既定）', () => {
  it('initialEnabled: true なら最初から入で、AudioContext はまだ作らない', () => {
    const createContext = vi.fn(() => fakeAudioContext())
    const { result } = renderHook(() => useSound({ createContext, initialEnabled: true }))
    expect(result.current.enabled).toBe(true)
    expect(createContext).not.toHaveBeenCalled()
  })
  it('入のまま最初の play で createContext を 1 回だけ呼んで resume し、その段取りを鳴らす。2 回目は作り直さない', () => {
    const ctx = fakeAudioContext(2)
    const createContext = vi.fn(() => ctx)
    const { result } = renderHook(() => useSound({ createContext, initialEnabled: true }))
    act(() => result.current.play(steps))
    expect(createContext).toHaveBeenCalledTimes(1)
    expect(ctx.resume).toHaveBeenCalledTimes(1)
    expect(ctx.oscs).toHaveLength(1)
    expect(ctx.oscs[0].start).toHaveBeenCalledWith(2)
    act(() => result.current.play(steps))
    expect(createContext).toHaveBeenCalledTimes(1)
    expect(ctx.oscs).toHaveLength(2)
  })
  it('最初の play でも audioSession.type を playback にしてから AudioContext を作る', () => {
    const audioSession = { type: 'auto' }
    const seen: string[] = []
    const createContext = () => { seen.push(audioSession.type); return fakeAudioContext() }
    const { result } = renderHook(() => useSound({ createContext, getAudioSession: () => audioSession, initialEnabled: true }))
    act(() => result.current.play(steps))
    expect(seen).toEqual(['playback'])
  })
  it('入で開いて切にすると、作っていなくても落ちず、以後 play しても作らない', () => {
    const createContext = vi.fn(() => fakeAudioContext())
    const { result } = renderHook(() => useSound({ createContext, initialEnabled: true }))
    act(() => result.current.toggle())
    expect(result.current.enabled).toBe(false)
    act(() => result.current.play(steps))
    expect(createContext).not.toHaveBeenCalled()
  })
})

describe('useSound とマナーモード（F-506）', () => {
  it('入にすると audioSession.type を playback にし、切に戻すと auto に戻す', () => {
    const ctx = fakeAudioContext()
    const audioSession = { type: 'auto' }
    const { result } = renderHook(() => useSound({ createContext: () => ctx, getAudioSession: () => audioSession }))
    act(() => result.current.toggle())
    expect(audioSession.type).toBe('playback')
    act(() => result.current.toggle())
    expect(audioSession.type).toBe('auto')
  })
  it('audioSession を playback にするのは AudioContext を作る前（作成済みの文脈には効かない）', () => {
    const audioSession = { type: 'auto' }
    const seen: string[] = []
    const createContext = () => { seen.push(audioSession.type); return fakeAudioContext() }
    const { result } = renderHook(() => useSound({ createContext, getAudioSession: () => audioSession }))
    act(() => result.current.toggle())
    expect(seen).toEqual(['playback'])
  })
  it('audioSession が無い環境でも入切できる', () => {
    const ctx = fakeAudioContext()
    const { result } = renderHook(() => useSound({ createContext: () => ctx, getAudioSession: () => null }))
    act(() => result.current.toggle())
    expect(result.current.enabled).toBe(true)
  })
})
