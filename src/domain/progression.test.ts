import { describe, it, expect } from 'vitest'
import { note, formatNote, pitchClass, hasDoubleAccidental } from './pitch'
import { KEYS } from './scale'
import { keySevenths, diatonicChords, nonDiatonicChords, type LabeledChord } from './progression'

const names = (xs: LabeledChord[]) => xs.map((x) => x.chord.name)
const outside = (x: LabeledChord) =>
  x.chord.tones.filter((t) => x.outsidePitchClasses.has(pitchClass(t.note))).map((t) => formatNote(t.note))

describe('progression', () => {
  it('キー C のセブンス 4 種はキー始まりで M7 m7 7 m7♭5 の順', () => {
    const xs = keySevenths(note('C'))
    expect(names(xs)).toEqual(['CM7', 'Cm7', 'C7', 'Cm7♭5'])
    expect(xs.map((x) => x.roman)).toEqual(['IM7', 'Im7', 'I7', 'Im7♭5'])
  })
  it('キー C のダイアトニック', () => {
    const xs = diatonicChords(note('C'))
    expect(names(xs)).toEqual(['CM7', 'Dm7', 'Em7', 'FM7', 'G7', 'Am7', 'Bm7♭5'])
    expect(xs.map((x) => x.roman)).toEqual(['IM7', 'IIm7', 'IIIm7', 'IVM7', 'V7', 'VIm7', 'VIIm7♭5'])
    expect(xs.every((x) => x.outsidePitchClasses.size === 0)).toBe(true)
  })
  it('キー C のノンダイアトニックと外れ音（ホワイトボードの 8 つ）', () => {
    const xs = nonDiatonicChords(note('C'))
    expect(names(xs)).toEqual(['C7', 'D7', 'E7', 'FmM7', 'Gm7', 'A7', 'A♭M7', 'B♭7'])
    expect(xs.map((x) => x.roman)).toEqual(['I7', 'II7', 'III7', 'IVmM7', 'Vm7', 'VI7', '♭VIM7', '♭VII7'])
    expect(xs.map(outside)).toEqual([['B♭'], ['F♯'], ['G♯'], ['A♭'], ['B♭'], ['C♯'], ['A♭', 'E♭'], ['B♭', 'A♭']])
  })
  it('読み替えの 12 箇所', () => {
    expect(names(keySevenths(note('G', -1)))).toEqual(['G♭M7', 'F♯m7', 'G♭7', 'F♯m7♭5'])
    expect(names(keySevenths(note('D', -1)))[3]).toBe('C♯m7♭5')
    expect(names(keySevenths(note('A', -1)))[3]).toBe('G♯m7♭5')
    expect(names(keySevenths(note('E', -1)))[3]).toBe('D♯m7♭5')
    expect(names(nonDiatonicChords(note('B')))[2]).toBe('E♭7')
    expect(names(nonDiatonicChords(note('D', -1))).slice(3)).toEqual(['F♯mM7', 'A♭m7', 'B♭7', 'AM7', 'B7'])
    expect(names(nonDiatonicChords(note('G', -1))).slice(3)).toEqual(['BmM7', 'D♭m7', 'E♭7', 'DM7', 'E7'])
  })
  it('読み替え後も外れ音はピッチクラスで判定する', () => {
    const xs = nonDiatonicChords(note('D', -1))
    expect(outside(xs[3])).toEqual(['A']) // F♯mM7: F♯ A C♯ E♯ → A だけ外
    expect(outside(xs[6])).toEqual(['A', 'E']) // AM7
    expect(outside(xs[7])).toEqual(['B', 'A']) // B7
  })
  it.each(KEYS.map((k) => [formatNote(k), k] as const))('%s の全コードにダブル変化記号が無い', (_, key) => {
    for (const x of [...keySevenths(key), ...diatonicChords(key), ...nonDiatonicChords(key)]) {
      expect(x.chord.tones.some((t) => hasDoubleAccidental(t.note))).toBe(false)
    }
  })
})
