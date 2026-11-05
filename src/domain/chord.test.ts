import { describe, it, expect } from 'vitest'
import { note, formatNote } from './pitch'
import { buildChord, QUALITY_SUFFIX, type Chord } from './chord'

const tones = (c: Chord) => c.tones.map((t) => `${formatNote(t.note)}:${t.degreeLabel}`).join(' ') // 音名:コード度数

describe('chord', () => {
  it('品質ごとの度数ラベルと半音', () => {
    expect(tones(buildChord(note('C'), 'M7'))).toBe('C:1 E:3 G:5 B:7')
    expect(tones(buildChord(note('C'), 'm7'))).toBe('C:1 E♭:♭3 G:5 B♭:♭7')
    expect(tones(buildChord(note('C'), '7'))).toBe('C:1 E:3 G:5 B♭:♭7')
    expect(tones(buildChord(note('C'), 'm7b5'))).toBe('C:1 E♭:♭3 G♭:♭5 B♭:♭7')
    expect(tones(buildChord(note('F'), 'mM7'))).toBe('F:1 A♭:♭3 C:5 E:7')
  })
  it('コードネームは根音＋品質の接尾辞', () => {
    expect(QUALITY_SUFFIX).toEqual({ M7: 'M7', m7: 'm7', '7': '7', m7b5: 'm7♭5', mM7: 'mM7' })
    expect(buildChord(note('D'), '7').name).toBe('D7')
    expect(buildChord(note('C'), 'm7b5').name).toBe('Cm7♭5')
    expect(buildChord(note('F'), 'mM7').name).toBe('FmM7')
  })
  it('文字送りで綴る（D7 の 3 度は F♯）', () => {
    expect(tones(buildChord(note('D'), '7'))).toBe('D:1 F♯:3 A:5 C:♭7')
  })
  it('ダブル変化記号が出るコードは根音を読み替える', () => {
    expect(buildChord(note('G', -1), 'm7b5').name).toBe('F♯m7♭5')
    expect(tones(buildChord(note('G', -1), 'm7b5'))).toBe('F♯:1 A:♭3 C:♭5 E:♭7')
    expect(buildChord(note('G', -1), 'm7').name).toBe('F♯m7')
    expect(buildChord(note('B', -2), 'M7').name).toBe('AM7') // キー D♭ の ♭VI
    expect(buildChord(note('E', -2), 'M7').name).toBe('DM7') // キー G♭ の ♭VI
    expect(buildChord(note('D', 1), '7').name).toBe('E♭7') // キー B の III7
    expect(tones(buildChord(note('G', -1), 'mM7'))).toBe('F♯:1 A:♭3 C♯:5 E♯:7') // E♯ は残す
  })
  it('読み替え不要なら元の綴りを保つ（D♭m7 の F♭）', () => {
    expect(tones(buildChord(note('D', -1), 'm7'))).toBe('D♭:1 F♭:♭3 A♭:5 C♭:♭7')
    expect(buildChord(note('D', -1), 'm7').root).toEqual(note('D', -1))
  })
})
