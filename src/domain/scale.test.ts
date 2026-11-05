import { describe, it, expect } from 'vitest'
import { note, formatNote } from './pitch'
import { KEYS, majorScale, majorPentatonic, relativeMinorPentatonic, scalePitchClasses } from './scale'

const SCALES: Record<string, string> = {
  'C': 'C D E F G A B', 'G': 'G A B C D E F♯', 'D': 'D E F♯ G A B C♯',
  'A': 'A B C♯ D E F♯ G♯', 'E': 'E F♯ G♯ A B C♯ D♯', 'B': 'B C♯ D♯ E F♯ G♯ A♯',
  'G♭': 'G♭ A♭ B♭ C♭ D♭ E♭ F', 'D♭': 'D♭ E♭ F G♭ A♭ B♭ C', 'A♭': 'A♭ B♭ C D♭ E♭ F G',
  'E♭': 'E♭ F G A♭ B♭ C D', 'B♭': 'B♭ C D E♭ F G A', 'F': 'F G A B♭ C D E',
}

describe('scale', () => {
  it('KEYS は 5 度圏の順で 12 個', () => {
    expect(KEYS.map(formatNote)).toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'])
  })
  it.each(KEYS.map((k) => [formatNote(k), k] as const))('majorScale %s', (name, key) => {
    expect(majorScale(key).map(formatNote).join(' ')).toBe(SCALES[name])
  })
  it('scalePitchClasses は 7 つのピッチクラス', () => {
    expect([...scalePitchClasses(note('C'))].sort((a, b) => a - b)).toEqual([0, 2, 4, 5, 7, 9, 11])
  })
  it('メジャーペンタは 1 2 3 5 6', () => {
    expect(majorPentatonic(note('C')).map((t) => `${formatNote(t.note)}:${t.degreeLabel}`)).toEqual(['C:1', 'D:2', 'E:3', 'G:5', 'A:6'])
  })
  it('マイナーペンタは平行調の根音から 1 ♭3 4 5 ♭7', () => {
    const m = relativeMinorPentatonic(note('C'))
    expect(formatNote(m.root)).toBe('A')
    expect(m.tones.map((t) => `${formatNote(t.note)}:${t.degreeLabel}`)).toEqual(['A:1', 'C:♭3', 'D:4', 'E:5', 'G:♭7'])
  })
  it('G♭ のマイナーペンタの根音は E♭', () => {
    expect(formatNote(relativeMinorPentatonic(note('G', -1)).root)).toBe('E♭')
  })
})
