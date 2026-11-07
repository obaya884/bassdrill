// 音の高さと鳴らす段取り（F-306・F-406）。12 キー全件で「低い順」「根音の範囲」「答えが基準より上」を検証する（N-04）
import { describe, it, expect } from 'vitest'
import { note, pitchClass, formatNote } from './pitch'
import { KEYS, majorScale, majorPentatonic, relativeMinorPentatonic } from './scale'
import { keySevenths, diatonicChords, nonDiatonicChords } from './progression'
import { INTERVALS, INTERVAL_SPEC } from './quiz'
import {
  frequency, rootMidi, chordSound, quizSound,
  CHORD_NOTE_SECONDS, CHORD_BLOCK_SECONDS, QUIZ_BASE_SECONDS, QUIZ_ANSWER_SECONDS,
  scaleSound,
} from './sound'

describe('frequency', () => {
  it('A4 = 440 Hz、C4 ≈ 261.63 Hz、1 オクターブで 2 倍', () => {
    expect(frequency(69)).toBe(440)
    expect(frequency(60)).toBeCloseTo(261.63, 2)
    expect(frequency(52) / frequency(40)).toBeCloseTo(2, 6)
  })
})

describe('rootMidi', () => {
  it('E は 40、E♭ は 51 で、12 キーすべて 40〜51 に収まりピッチクラスが合う', () => {
    expect(rootMidi(note('E'))).toBe(40)
    expect(rootMidi(note('E', -1))).toBe(51)
    for (const k of KEYS) {
      const m = rootMidi(k)
      expect(m).toBeGreaterThanOrEqual(40)
      expect(m).toBeLessThanOrEqual(51)
      expect(m % 12).toBe(pitchClass(k))
    }
  })
  it('異名同音は同じ高さ（F♯ と G♭）', () => {
    expect(rootMidi(note('F', 1))).toBe(rootMidi(note('G', -1)))
  })
})

describe('chordSound', () => {
  it('12 キー × 19 コードで、4 音を低い順に 1 音ずつ 0.3 秒、最後に 4 音同時 1.0 秒', () => {
    for (const k of KEYS) {
      for (const x of [...keySevenths(k), ...diatonicChords(k), ...nonDiatonicChords(k)]) {
        const steps = chordSound(x.chord)
        expect(steps, `${formatNote(k)} ${x.chord.name}`).toHaveLength(5)
        const midis = steps.slice(0, 4).map((s) => s.midis[0])
        expect(midis).toEqual([...midis].sort((a, b) => a - b))
        expect(midis[0]).toBe(rootMidi(x.chord.root))
        expect(midis[3] - midis[0]).toBeLessThan(12)
        midis.forEach((m, i) => expect(m % 12).toBe(pitchClass(x.chord.tones[i].note)))
        steps.slice(0, 4).forEach((s) => {
          expect(s.midis).toHaveLength(1)
          expect(s.seconds).toBe(CHORD_NOTE_SECONDS)
        })
        expect(steps[4]).toEqual({ midis, seconds: CHORD_BLOCK_SECONDS })
      }
    }
  })
})

describe('quizSound', () => {
  it('12 キー × 7 基準 × 8 音程で、基準 0.5 秒 → 答え 0.7 秒。答えは基準より半音数ぶん上', () => {
    for (const k of KEYS) {
      for (const base of majorScale(k)) {
        for (const iv of INTERVALS) {
          expect(quizSound(base, iv)).toEqual([
            { midis: [rootMidi(base)], seconds: QUIZ_BASE_SECONDS },
            { midis: [rootMidi(base) + INTERVAL_SPEC[iv].semitones], seconds: QUIZ_ANSWER_SECONDS },
          ])
        }
      }
    }
  })
})

describe('scaleSound（F-206）: 根音 → 1 オクターブ上 → 根音の上下行', () => {
  it('C メジャースケールは 15 音。上りは半音 0 2 4 5 7 9 11 12、下りはその逆で根音に戻る。各 0.3 秒', () => {
    const c = { letter: 'C', accidental: 0 } as const
    const steps = scaleSound(c, majorScale(c))
    const root = rootMidi(c)
    expect(steps.map((s) => s.midis[0] - root)).toEqual([0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0])
    expect(steps.every((s) => s.midis.length === 1 && s.seconds === CHORD_NOTE_SECONDS)).toBe(true)
  })
  it('A マイナーペンタは 11 音で、A の根音から 0 3 5 7 10 12 と上る', () => {
    const c = { letter: 'C', accidental: 0 } as const
    const { root, tones } = relativeMinorPentatonic(c)
    const steps = scaleSound(root, tones.map((t) => t.note))
    expect(steps).toHaveLength(11)
    expect(steps.map((s) => s.midis[0] - rootMidi(root))).toEqual([0, 3, 5, 7, 10, 12, 10, 7, 5, 3, 0])
  })
  it('12 キーすべてで、メジャースケールもメジャーペンタも根音から単調に上って同じ道を下り、根音は E2〜E♭3', () => {
    for (const key of KEYS) {
      for (const notes of [majorScale(key), majorPentatonic(key).map((t) => t.note)]) {
        const steps = scaleSound(key, notes)
        const up = steps.slice(0, notes.length + 1).map((s) => s.midis[0])
        expect(up[0]).toBeGreaterThanOrEqual(40)
        expect(up[0]).toBeLessThanOrEqual(51)
        expect(up[up.length - 1]).toBe(up[0] + 12)
        for (let i = 1; i < up.length; i++) expect(up[i]).toBeGreaterThan(up[i - 1])
        expect(steps.slice(notes.length + 1).map((s) => s.midis[0])).toEqual(up.slice(0, -1).reverse())
      }
    }
  })
})
