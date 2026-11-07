import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDrillState } from './useDrillState'
import { equalsNote } from '../domain/pitch'
import { dayNumber, keyForDay } from '../domain/dailyKey'
import { nextOnCircle } from '../domain/scale'
import { SECTIONS } from './sections'
import { fakeAudioContext } from '../test/fakeAudio'
import { chordSound, quizSound } from '../domain/sound'
import { diatonicChords } from '../domain/progression'
import { baseNote } from '../domain/quiz'

const NOW = new Date('2026-11-05T09:00:00+09:00')

describe('useDrillState', () => {
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
    expect(equalsNote(result.current.currentKey, nextOnCircle(result.current.todayKey))).toBe(true)
    expect(result.current.chordIndex.nonDiatonic).toBe(0)
    const chosen = result.current.scale[3]
    act(() => result.current.selectKey(chosen))
    expect(result.current.focus).toBe('nonDiatonic')
    expect(equalsNote(result.current.currentKey, chosen)).toBe(true)
  })
  it('moveFocus は端で止まる', () => {
    const { result } = renderHook(() => useDrillState({ now: NOW }))
    act(() => result.current.moveFocus(-1))
    expect(result.current.focus).toBe('scale')
    for (let i = 0; i < 10; i++) act(() => result.current.moveFocus(1))
    expect(result.current.focus).toBe('nonDiatonic')
  })
  it('todayKey は進めても手で選んでも変わらず、何も保存しない', () => {
    const { result } = renderHook(() => useDrillState({ now: NOW }))
    const today = keyForDay(dayNumber(NOW))
    expect(equalsNote(result.current.todayKey, today)).toBe(true)
    act(() => result.current.nextKey())
    act(() => result.current.selectKey(result.current.scale[4]))
    expect(equalsNote(result.current.todayKey, today)).toBe(true)
    expect(equalsNote(result.current.currentKey, today)).toBe(false)
    expect(localStorage.length).toBe(0)
  })
  it('nextKey は今のキー（手で選んだキーでも）の 5 度上。12 回で元に戻る', () => {
    const { result } = renderHook(() => useDrillState({ now: NOW }))
    act(() => result.current.selectKey(result.current.scale[1]))
    const from = result.current.currentKey
    act(() => result.current.nextKey())
    expect(equalsNote(result.current.currentKey, nextOnCircle(from))).toBe(true)
    for (let i = 0; i < 11; i++) act(() => result.current.nextKey())
    expect(equalsNote(result.current.currentKey, from)).toBe(true)
  })
})

describe('useDrillState の音（F-306・F-406・F-506）', () => {
  const setup = () => {
    const ctx = fakeAudioContext(1)
    const { result } = renderHook(() => useDrillState({ now: NOW, createAudioContext: () => ctx }))
    return { ctx, result }
  }
  it('sound は既定で切。切のまま selectChord と答えを押しても何も鳴らない', () => {
    const { ctx, result } = setup()
    expect(result.current.sound.enabled).toBe(false)
    act(() => result.current.selectChord('diatonic', 2))
    act(() => result.current.quiz.advance())
    expect(ctx.oscs).toHaveLength(0)
  })
  it('入にして selectChord すると、そのコードの段取り（4 音 + 和音 = 8 音）が予約される。同じ行をもう一度選んでも鳴る', () => {
    const { ctx, result } = setup()
    act(() => result.current.sound.toggle())
    act(() => result.current.selectChord('diatonic', 2))
    expect(ctx.oscs).toHaveLength(8)
    const expected = chordSound(diatonicChords(result.current.currentKey)[2].chord)
    expect(ctx.oscs[0].frequency.value).toBeCloseTo(440 * 2 ** ((expected[0].midis[0] - 69) / 12), 6)
    act(() => result.current.selectChord('diatonic', 2))
    expect(ctx.oscs).toHaveLength(16)
  })
  it('入にして「答え」で基準→答えの 2 音が鳴り、「次」では鳴らない', () => {
    const { ctx, result } = setup()
    act(() => result.current.sound.toggle())
    const q = result.current.quiz.question
    const expected = quizSound(baseNote(q, result.current.scale), q.interval)
    act(() => result.current.quiz.advance())
    expect(result.current.quiz.phase).toBe('answered')
    expect(ctx.oscs).toHaveLength(2)
    expect(ctx.oscs[1].frequency.value).toBeCloseTo(440 * 2 ** ((expected[1].midis[0] - 69) / 12), 6)
    act(() => result.current.quiz.advance())
    expect(result.current.quiz.phase).toBe('asking')
    expect(ctx.oscs).toHaveLength(2)
  })
  it('nextKey・selectKey・moveFocus では鳴らない', () => {
    const { ctx, result } = setup()
    act(() => result.current.sound.toggle())
    act(() => result.current.nextKey())
    act(() => result.current.selectKey(result.current.scale[3]))
    act(() => result.current.moveFocus(1))
    expect(ctx.oscs).toHaveLength(0)
  })
})
