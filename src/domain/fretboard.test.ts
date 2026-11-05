import { describe, it, expect } from 'vitest'
import { note, formatNote } from './pitch'
import { majorScale } from './scale'
import { STRINGS, FRET_COUNT, MARKER_FRETS, markersFor, type ToneSpec } from './fretboard'

describe('fretboard', () => {
  it('弦は上から G D A E、フレットは 12、ポジションマークは 3 5 7 9 12', () => {
    expect(STRINGS.map((s) => `${s.name}${s.openPitchClass}`)).toEqual(['G7', 'D2', 'A9', 'E4'])
    expect(FRET_COUNT).toBe(12)
    expect(MARKER_FRETS).toEqual([3, 5, 7, 9, 12])
  })
  it('C メジャースケールの E 弦', () => {
    const scale: ToneSpec[] = majorScale(note('C')).map((n, i) => ({ note: n, label: String(i + 1), kind: i === 0 ? 'root' : 'tone' }))
    const e = markersFor(scale).filter((m) => m.string === 3)
    expect(e.map((m) => `${m.fret}${formatNote(m.note)}`)).toEqual(['0E', '1F', '3G', '5A', '7B', '8C', '10D', '12E'])
    expect(e.find((m) => m.fret === 8)?.kind).toBe('root')
    expect(e.find((m) => m.fret === 8)?.label).toBe('1')
  })
  it('同じ音は 1 弦に 2 回出ることがある（0 と 12）', () => {
    expect(markersFor([{ note: note('G'), label: '1', kind: 'root' }]).filter((m) => m.string === 0).map((m) => m.fret)).toEqual([0, 12])
  })
  it('弦順・フレット順に並ぶ', () => {
    const ms = markersFor([{ note: note('A'), label: '1', kind: 'root' }, { note: note('E'), label: '5', kind: 'tone' }])
    const keys = ms.map((m) => m.string * 100 + m.fret)
    expect([...keys].sort((a, b) => a - b)).toEqual(keys)
  })
})
