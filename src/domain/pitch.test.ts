import { describe, it, expect } from 'vitest'
import {
  LETTERS, note, pitchClass, formatNote, stepLetter, spellFromLetter,
  simpleSpellings, hasDoubleAccidental, equalsNote,
} from './pitch'

describe('pitch', () => {
  it('LETTERS は C から B の 7 文字', () => {
    expect(LETTERS).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })
  it('pitchClass は C=0、C♭=11、B♯=0、B♭=10', () => {
    expect(pitchClass(note('C'))).toBe(0)
    expect(pitchClass(note('C', -1))).toBe(11)
    expect(pitchClass(note('B', 1))).toBe(0)
    expect(pitchClass(note('B', -1))).toBe(10)
  })
  it('formatNote は ♯♭ と 𝄪𝄫 を使う', () => {
    expect(formatNote(note('C'))).toBe('C')
    expect(formatNote(note('F', 1))).toBe('F♯')
    expect(formatNote(note('B', -1))).toBe('B♭')
    expect(formatNote(note('E', -2))).toBe('E𝄫')
    expect(formatNote(note('F', 2))).toBe('F𝄪')
  })
  it('stepLetter は文字を前へ進めて B の次は C', () => {
    expect(stepLetter('B', 2)).toBe('D')
    expect(stepLetter('C', 0)).toBe('C')
    expect(stepLetter('A', 6)).toBe('G')
  })
  it('spellFromLetter は最も近い変化記号を選ぶ', () => {
    expect(spellFromLetter('F', 6)).toEqual(note('F', 1))
    expect(spellFromLetter('C', 11)).toEqual(note('C', -1))
    expect(spellFromLetter('B', 0)).toEqual(note('B', 1))
    expect(spellFromLetter('E', 2)).toEqual(note('E', -2))
  })
  it('spellFromLetter は ±2 を超える綴りを拒む', () => {
    expect(() => spellFromLetter('C', 6)).toThrow()
  })
  it('simpleSpellings は変化記号 1 つ以内の綴りを少ない順、同数なら ♯ 先に返す', () => {
    expect(simpleSpellings(6).map(formatNote)).toEqual(['F♯', 'G♭'])
    expect(simpleSpellings(9).map(formatNote)).toEqual(['A'])
    expect(simpleSpellings(11).map(formatNote)).toEqual(['B', 'C♭'])
    expect(simpleSpellings(4).map(formatNote)).toEqual(['E', 'F♭'])
  })
  it('hasDoubleAccidental と equalsNote', () => {
    expect(hasDoubleAccidental(note('E', -2))).toBe(true)
    expect(hasDoubleAccidental(note('E', -1))).toBe(false)
    expect(equalsNote(note('F', 1), note('F', 1))).toBe(true)
    expect(equalsNote(note('F', 1), note('G', -1))).toBe(false)
  })
})
