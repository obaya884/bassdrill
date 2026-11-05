// N-04: 12 キー × { ペンタ・セブンス 4 種・ダイアトニック 7・ノンダイアトニック 8 とその外れ音 } の期待値表。
// 2026-11-05 に実装から書き出し、レビュー役の独立検算（全キー）とオーナー側の目視（C・E・A♭・D♭・G♭・B）で固定した。
// 表記は「音名:コード度数」、末尾の「| 外: …」はスケールに無い構成音。読み替え（F-305）の 12 箇所もこの表が守る。
import { describe, it, expect } from 'vitest'
import { formatNote, pitchClass } from './pitch'
import { KEYS, majorPentatonic, relativeMinorPentatonic, type ScaleTone } from './scale'
import { keySevenths, diatonicChords, nonDiatonicChords, type LabeledChord } from './progression'

const tone = (t: ScaleTone | { note: LabeledChord['chord']['tones'][number]['note']; degreeLabel: string }) => `${formatNote(t.note)}:${t.degreeLabel}`
const chord = (x: LabeledChord) => {
  const outside = x.chord.tones.filter((t) => x.outsidePitchClasses.has(pitchClass(t.note))).map((t) => formatNote(t.note))
  return `${x.roman} ${x.chord.name} = ${x.chord.tones.map(tone).join(' ')}${outside.length ? ` | 外: ${outside.join(' ')}` : ''}`
}

type Row = { majorPenta: string; minorPenta: string; sevenths: string[]; diatonic: string[]; nonDiatonic: string[] }

const TABLE: Record<string, Row> = {
  'C': {
    majorPenta: 'C:1 D:2 E:3 G:5 A:6',
    minorPenta: 'A: A:1 C:♭3 D:4 E:5 G:♭7',
    sevenths: [
      'IM7 CM7 = C:1 E:3 G:5 B:7',
      'Im7 Cm7 = C:1 E♭:♭3 G:5 B♭:♭7 | 外: E♭ B♭',
      'I7 C7 = C:1 E:3 G:5 B♭:♭7 | 外: B♭',
      'Im7♭5 Cm7♭5 = C:1 E♭:♭3 G♭:♭5 B♭:♭7 | 外: E♭ G♭ B♭',
    ],
    diatonic: [
      'IM7 CM7 = C:1 E:3 G:5 B:7',
      'IIm7 Dm7 = D:1 F:♭3 A:5 C:♭7',
      'IIIm7 Em7 = E:1 G:♭3 B:5 D:♭7',
      'IVM7 FM7 = F:1 A:3 C:5 E:7',
      'V7 G7 = G:1 B:3 D:5 F:♭7',
      'VIm7 Am7 = A:1 C:♭3 E:5 G:♭7',
      'VIIm7♭5 Bm7♭5 = B:1 D:♭3 F:♭5 A:♭7',
    ],
    nonDiatonic: [
      'I7 C7 = C:1 E:3 G:5 B♭:♭7 | 外: B♭',
      'II7 D7 = D:1 F♯:3 A:5 C:♭7 | 外: F♯',
      'III7 E7 = E:1 G♯:3 B:5 D:♭7 | 外: G♯',
      'IVmM7 FmM7 = F:1 A♭:♭3 C:5 E:7 | 外: A♭',
      'Vm7 Gm7 = G:1 B♭:♭3 D:5 F:♭7 | 外: B♭',
      'VI7 A7 = A:1 C♯:3 E:5 G:♭7 | 外: C♯',
      '♭VIM7 A♭M7 = A♭:1 C:3 E♭:5 G:7 | 外: A♭ E♭',
      '♭VII7 B♭7 = B♭:1 D:3 F:5 A♭:♭7 | 外: B♭ A♭',
    ],
  },
  'G': {
    majorPenta: 'G:1 A:2 B:3 D:5 E:6',
    minorPenta: 'E: E:1 G:♭3 A:4 B:5 D:♭7',
    sevenths: [
      'IM7 GM7 = G:1 B:3 D:5 F♯:7',
      'Im7 Gm7 = G:1 B♭:♭3 D:5 F:♭7 | 外: B♭ F',
      'I7 G7 = G:1 B:3 D:5 F:♭7 | 外: F',
      'Im7♭5 Gm7♭5 = G:1 B♭:♭3 D♭:♭5 F:♭7 | 外: B♭ D♭ F',
    ],
    diatonic: [
      'IM7 GM7 = G:1 B:3 D:5 F♯:7',
      'IIm7 Am7 = A:1 C:♭3 E:5 G:♭7',
      'IIIm7 Bm7 = B:1 D:♭3 F♯:5 A:♭7',
      'IVM7 CM7 = C:1 E:3 G:5 B:7',
      'V7 D7 = D:1 F♯:3 A:5 C:♭7',
      'VIm7 Em7 = E:1 G:♭3 B:5 D:♭7',
      'VIIm7♭5 F♯m7♭5 = F♯:1 A:♭3 C:♭5 E:♭7',
    ],
    nonDiatonic: [
      'I7 G7 = G:1 B:3 D:5 F:♭7 | 外: F',
      'II7 A7 = A:1 C♯:3 E:5 G:♭7 | 外: C♯',
      'III7 B7 = B:1 D♯:3 F♯:5 A:♭7 | 外: D♯',
      'IVmM7 CmM7 = C:1 E♭:♭3 G:5 B:7 | 外: E♭',
      'Vm7 Dm7 = D:1 F:♭3 A:5 C:♭7 | 外: F',
      'VI7 E7 = E:1 G♯:3 B:5 D:♭7 | 外: G♯',
      '♭VIM7 E♭M7 = E♭:1 G:3 B♭:5 D:7 | 外: E♭ B♭',
      '♭VII7 F7 = F:1 A:3 C:5 E♭:♭7 | 外: F E♭',
    ],
  },
  'D': {
    majorPenta: 'D:1 E:2 F♯:3 A:5 B:6',
    minorPenta: 'B: B:1 D:♭3 E:4 F♯:5 A:♭7',
    sevenths: [
      'IM7 DM7 = D:1 F♯:3 A:5 C♯:7',
      'Im7 Dm7 = D:1 F:♭3 A:5 C:♭7 | 外: F C',
      'I7 D7 = D:1 F♯:3 A:5 C:♭7 | 外: C',
      'Im7♭5 Dm7♭5 = D:1 F:♭3 A♭:♭5 C:♭7 | 外: F A♭ C',
    ],
    diatonic: [
      'IM7 DM7 = D:1 F♯:3 A:5 C♯:7',
      'IIm7 Em7 = E:1 G:♭3 B:5 D:♭7',
      'IIIm7 F♯m7 = F♯:1 A:♭3 C♯:5 E:♭7',
      'IVM7 GM7 = G:1 B:3 D:5 F♯:7',
      'V7 A7 = A:1 C♯:3 E:5 G:♭7',
      'VIm7 Bm7 = B:1 D:♭3 F♯:5 A:♭7',
      'VIIm7♭5 C♯m7♭5 = C♯:1 E:♭3 G:♭5 B:♭7',
    ],
    nonDiatonic: [
      'I7 D7 = D:1 F♯:3 A:5 C:♭7 | 外: C',
      'II7 E7 = E:1 G♯:3 B:5 D:♭7 | 外: G♯',
      'III7 F♯7 = F♯:1 A♯:3 C♯:5 E:♭7 | 外: A♯',
      'IVmM7 GmM7 = G:1 B♭:♭3 D:5 F♯:7 | 外: B♭',
      'Vm7 Am7 = A:1 C:♭3 E:5 G:♭7 | 外: C',
      'VI7 B7 = B:1 D♯:3 F♯:5 A:♭7 | 外: D♯',
      '♭VIM7 B♭M7 = B♭:1 D:3 F:5 A:7 | 外: B♭ F',
      '♭VII7 C7 = C:1 E:3 G:5 B♭:♭7 | 外: C B♭',
    ],
  },
  'A': {
    majorPenta: 'A:1 B:2 C♯:3 E:5 F♯:6',
    minorPenta: 'F♯: F♯:1 A:♭3 B:4 C♯:5 E:♭7',
    sevenths: [
      'IM7 AM7 = A:1 C♯:3 E:5 G♯:7',
      'Im7 Am7 = A:1 C:♭3 E:5 G:♭7 | 外: C G',
      'I7 A7 = A:1 C♯:3 E:5 G:♭7 | 外: G',
      'Im7♭5 Am7♭5 = A:1 C:♭3 E♭:♭5 G:♭7 | 外: C E♭ G',
    ],
    diatonic: [
      'IM7 AM7 = A:1 C♯:3 E:5 G♯:7',
      'IIm7 Bm7 = B:1 D:♭3 F♯:5 A:♭7',
      'IIIm7 C♯m7 = C♯:1 E:♭3 G♯:5 B:♭7',
      'IVM7 DM7 = D:1 F♯:3 A:5 C♯:7',
      'V7 E7 = E:1 G♯:3 B:5 D:♭7',
      'VIm7 F♯m7 = F♯:1 A:♭3 C♯:5 E:♭7',
      'VIIm7♭5 G♯m7♭5 = G♯:1 B:♭3 D:♭5 F♯:♭7',
    ],
    nonDiatonic: [
      'I7 A7 = A:1 C♯:3 E:5 G:♭7 | 外: G',
      'II7 B7 = B:1 D♯:3 F♯:5 A:♭7 | 外: D♯',
      'III7 C♯7 = C♯:1 E♯:3 G♯:5 B:♭7 | 外: E♯',
      'IVmM7 DmM7 = D:1 F:♭3 A:5 C♯:7 | 外: F',
      'Vm7 Em7 = E:1 G:♭3 B:5 D:♭7 | 外: G',
      'VI7 F♯7 = F♯:1 A♯:3 C♯:5 E:♭7 | 外: A♯',
      '♭VIM7 FM7 = F:1 A:3 C:5 E:7 | 外: F C',
      '♭VII7 G7 = G:1 B:3 D:5 F:♭7 | 外: G F',
    ],
  },
  'E': {
    majorPenta: 'E:1 F♯:2 G♯:3 B:5 C♯:6',
    minorPenta: 'C♯: C♯:1 E:♭3 F♯:4 G♯:5 B:♭7',
    sevenths: [
      'IM7 EM7 = E:1 G♯:3 B:5 D♯:7',
      'Im7 Em7 = E:1 G:♭3 B:5 D:♭7 | 外: G D',
      'I7 E7 = E:1 G♯:3 B:5 D:♭7 | 外: D',
      'Im7♭5 Em7♭5 = E:1 G:♭3 B♭:♭5 D:♭7 | 外: G B♭ D',
    ],
    diatonic: [
      'IM7 EM7 = E:1 G♯:3 B:5 D♯:7',
      'IIm7 F♯m7 = F♯:1 A:♭3 C♯:5 E:♭7',
      'IIIm7 G♯m7 = G♯:1 B:♭3 D♯:5 F♯:♭7',
      'IVM7 AM7 = A:1 C♯:3 E:5 G♯:7',
      'V7 B7 = B:1 D♯:3 F♯:5 A:♭7',
      'VIm7 C♯m7 = C♯:1 E:♭3 G♯:5 B:♭7',
      'VIIm7♭5 D♯m7♭5 = D♯:1 F♯:♭3 A:♭5 C♯:♭7',
    ],
    nonDiatonic: [
      'I7 E7 = E:1 G♯:3 B:5 D:♭7 | 外: D',
      'II7 F♯7 = F♯:1 A♯:3 C♯:5 E:♭7 | 外: A♯',
      'III7 G♯7 = G♯:1 B♯:3 D♯:5 F♯:♭7 | 外: B♯',
      'IVmM7 AmM7 = A:1 C:♭3 E:5 G♯:7 | 外: C',
      'Vm7 Bm7 = B:1 D:♭3 F♯:5 A:♭7 | 外: D',
      'VI7 C♯7 = C♯:1 E♯:3 G♯:5 B:♭7 | 外: E♯',
      '♭VIM7 CM7 = C:1 E:3 G:5 B:7 | 外: C G',
      '♭VII7 D7 = D:1 F♯:3 A:5 C:♭7 | 外: D C',
    ],
  },
  'B': {
    majorPenta: 'B:1 C♯:2 D♯:3 F♯:5 G♯:6',
    minorPenta: 'G♯: G♯:1 B:♭3 C♯:4 D♯:5 F♯:♭7',
    sevenths: [
      'IM7 BM7 = B:1 D♯:3 F♯:5 A♯:7',
      'Im7 Bm7 = B:1 D:♭3 F♯:5 A:♭7 | 外: D A',
      'I7 B7 = B:1 D♯:3 F♯:5 A:♭7 | 外: A',
      'Im7♭5 Bm7♭5 = B:1 D:♭3 F:♭5 A:♭7 | 外: D F A',
    ],
    diatonic: [
      'IM7 BM7 = B:1 D♯:3 F♯:5 A♯:7',
      'IIm7 C♯m7 = C♯:1 E:♭3 G♯:5 B:♭7',
      'IIIm7 D♯m7 = D♯:1 F♯:♭3 A♯:5 C♯:♭7',
      'IVM7 EM7 = E:1 G♯:3 B:5 D♯:7',
      'V7 F♯7 = F♯:1 A♯:3 C♯:5 E:♭7',
      'VIm7 G♯m7 = G♯:1 B:♭3 D♯:5 F♯:♭7',
      'VIIm7♭5 A♯m7♭5 = A♯:1 C♯:♭3 E:♭5 G♯:♭7',
    ],
    nonDiatonic: [
      'I7 B7 = B:1 D♯:3 F♯:5 A:♭7 | 外: A',
      'II7 C♯7 = C♯:1 E♯:3 G♯:5 B:♭7 | 外: E♯',
      'III7 E♭7 = E♭:1 G:3 B♭:5 D♭:♭7 | 外: G',
      'IVmM7 EmM7 = E:1 G:♭3 B:5 D♯:7 | 外: G',
      'Vm7 F♯m7 = F♯:1 A:♭3 C♯:5 E:♭7 | 外: A',
      'VI7 G♯7 = G♯:1 B♯:3 D♯:5 F♯:♭7 | 外: B♯',
      '♭VIM7 GM7 = G:1 B:3 D:5 F♯:7 | 外: G D',
      '♭VII7 A7 = A:1 C♯:3 E:5 G:♭7 | 外: A G',
    ],
  },
  'G♭': {
    majorPenta: 'G♭:1 A♭:2 B♭:3 D♭:5 E♭:6',
    minorPenta: 'E♭: E♭:1 G♭:♭3 A♭:4 B♭:5 D♭:♭7',
    sevenths: [
      'IM7 G♭M7 = G♭:1 B♭:3 D♭:5 F:7',
      'Im7 F♯m7 = F♯:1 A:♭3 C♯:5 E:♭7 | 外: A E',
      'I7 G♭7 = G♭:1 B♭:3 D♭:5 F♭:♭7 | 外: F♭',
      'Im7♭5 F♯m7♭5 = F♯:1 A:♭3 C:♭5 E:♭7 | 外: A C E',
    ],
    diatonic: [
      'IM7 G♭M7 = G♭:1 B♭:3 D♭:5 F:7',
      'IIm7 A♭m7 = A♭:1 C♭:♭3 E♭:5 G♭:♭7',
      'IIIm7 B♭m7 = B♭:1 D♭:♭3 F:5 A♭:♭7',
      'IVM7 C♭M7 = C♭:1 E♭:3 G♭:5 B♭:7',
      'V7 D♭7 = D♭:1 F:3 A♭:5 C♭:♭7',
      'VIm7 E♭m7 = E♭:1 G♭:♭3 B♭:5 D♭:♭7',
      'VIIm7♭5 Fm7♭5 = F:1 A♭:♭3 C♭:♭5 E♭:♭7',
    ],
    nonDiatonic: [
      'I7 G♭7 = G♭:1 B♭:3 D♭:5 F♭:♭7 | 外: F♭',
      'II7 A♭7 = A♭:1 C:3 E♭:5 G♭:♭7 | 外: C',
      'III7 B♭7 = B♭:1 D:3 F:5 A♭:♭7 | 外: D',
      'IVmM7 BmM7 = B:1 D:♭3 F♯:5 A♯:7 | 外: D',
      'Vm7 D♭m7 = D♭:1 F♭:♭3 A♭:5 C♭:♭7 | 外: F♭',
      'VI7 E♭7 = E♭:1 G:3 B♭:5 D♭:♭7 | 外: G',
      '♭VIM7 DM7 = D:1 F♯:3 A:5 C♯:7 | 外: D A',
      '♭VII7 E7 = E:1 G♯:3 B:5 D:♭7 | 外: E D',
    ],
  },
  'D♭': {
    majorPenta: 'D♭:1 E♭:2 F:3 A♭:5 B♭:6',
    minorPenta: 'B♭: B♭:1 D♭:♭3 E♭:4 F:5 A♭:♭7',
    sevenths: [
      'IM7 D♭M7 = D♭:1 F:3 A♭:5 C:7',
      'Im7 D♭m7 = D♭:1 F♭:♭3 A♭:5 C♭:♭7 | 外: F♭ C♭',
      'I7 D♭7 = D♭:1 F:3 A♭:5 C♭:♭7 | 外: C♭',
      'Im7♭5 C♯m7♭5 = C♯:1 E:♭3 G:♭5 B:♭7 | 外: E G B',
    ],
    diatonic: [
      'IM7 D♭M7 = D♭:1 F:3 A♭:5 C:7',
      'IIm7 E♭m7 = E♭:1 G♭:♭3 B♭:5 D♭:♭7',
      'IIIm7 Fm7 = F:1 A♭:♭3 C:5 E♭:♭7',
      'IVM7 G♭M7 = G♭:1 B♭:3 D♭:5 F:7',
      'V7 A♭7 = A♭:1 C:3 E♭:5 G♭:♭7',
      'VIm7 B♭m7 = B♭:1 D♭:♭3 F:5 A♭:♭7',
      'VIIm7♭5 Cm7♭5 = C:1 E♭:♭3 G♭:♭5 B♭:♭7',
    ],
    nonDiatonic: [
      'I7 D♭7 = D♭:1 F:3 A♭:5 C♭:♭7 | 外: C♭',
      'II7 E♭7 = E♭:1 G:3 B♭:5 D♭:♭7 | 外: G',
      'III7 F7 = F:1 A:3 C:5 E♭:♭7 | 外: A',
      'IVmM7 F♯mM7 = F♯:1 A:♭3 C♯:5 E♯:7 | 外: A',
      'Vm7 A♭m7 = A♭:1 C♭:♭3 E♭:5 G♭:♭7 | 外: C♭',
      'VI7 B♭7 = B♭:1 D:3 F:5 A♭:♭7 | 外: D',
      '♭VIM7 AM7 = A:1 C♯:3 E:5 G♯:7 | 外: A E',
      '♭VII7 B7 = B:1 D♯:3 F♯:5 A:♭7 | 外: B A',
    ],
  },
  'A♭': {
    majorPenta: 'A♭:1 B♭:2 C:3 E♭:5 F:6',
    minorPenta: 'F: F:1 A♭:♭3 B♭:4 C:5 E♭:♭7',
    sevenths: [
      'IM7 A♭M7 = A♭:1 C:3 E♭:5 G:7',
      'Im7 A♭m7 = A♭:1 C♭:♭3 E♭:5 G♭:♭7 | 外: C♭ G♭',
      'I7 A♭7 = A♭:1 C:3 E♭:5 G♭:♭7 | 外: G♭',
      'Im7♭5 G♯m7♭5 = G♯:1 B:♭3 D:♭5 F♯:♭7 | 外: B D F♯',
    ],
    diatonic: [
      'IM7 A♭M7 = A♭:1 C:3 E♭:5 G:7',
      'IIm7 B♭m7 = B♭:1 D♭:♭3 F:5 A♭:♭7',
      'IIIm7 Cm7 = C:1 E♭:♭3 G:5 B♭:♭7',
      'IVM7 D♭M7 = D♭:1 F:3 A♭:5 C:7',
      'V7 E♭7 = E♭:1 G:3 B♭:5 D♭:♭7',
      'VIm7 Fm7 = F:1 A♭:♭3 C:5 E♭:♭7',
      'VIIm7♭5 Gm7♭5 = G:1 B♭:♭3 D♭:♭5 F:♭7',
    ],
    nonDiatonic: [
      'I7 A♭7 = A♭:1 C:3 E♭:5 G♭:♭7 | 外: G♭',
      'II7 B♭7 = B♭:1 D:3 F:5 A♭:♭7 | 外: D',
      'III7 C7 = C:1 E:3 G:5 B♭:♭7 | 外: E',
      'IVmM7 D♭mM7 = D♭:1 F♭:♭3 A♭:5 C:7 | 外: F♭',
      'Vm7 E♭m7 = E♭:1 G♭:♭3 B♭:5 D♭:♭7 | 外: G♭',
      'VI7 F7 = F:1 A:3 C:5 E♭:♭7 | 外: A',
      '♭VIM7 F♭M7 = F♭:1 A♭:3 C♭:5 E♭:7 | 外: F♭ C♭',
      '♭VII7 G♭7 = G♭:1 B♭:3 D♭:5 F♭:♭7 | 外: G♭ F♭',
    ],
  },
  'E♭': {
    majorPenta: 'E♭:1 F:2 G:3 B♭:5 C:6',
    minorPenta: 'C: C:1 E♭:♭3 F:4 G:5 B♭:♭7',
    sevenths: [
      'IM7 E♭M7 = E♭:1 G:3 B♭:5 D:7',
      'Im7 E♭m7 = E♭:1 G♭:♭3 B♭:5 D♭:♭7 | 外: G♭ D♭',
      'I7 E♭7 = E♭:1 G:3 B♭:5 D♭:♭7 | 外: D♭',
      'Im7♭5 D♯m7♭5 = D♯:1 F♯:♭3 A:♭5 C♯:♭7 | 外: F♯ A C♯',
    ],
    diatonic: [
      'IM7 E♭M7 = E♭:1 G:3 B♭:5 D:7',
      'IIm7 Fm7 = F:1 A♭:♭3 C:5 E♭:♭7',
      'IIIm7 Gm7 = G:1 B♭:♭3 D:5 F:♭7',
      'IVM7 A♭M7 = A♭:1 C:3 E♭:5 G:7',
      'V7 B♭7 = B♭:1 D:3 F:5 A♭:♭7',
      'VIm7 Cm7 = C:1 E♭:♭3 G:5 B♭:♭7',
      'VIIm7♭5 Dm7♭5 = D:1 F:♭3 A♭:♭5 C:♭7',
    ],
    nonDiatonic: [
      'I7 E♭7 = E♭:1 G:3 B♭:5 D♭:♭7 | 外: D♭',
      'II7 F7 = F:1 A:3 C:5 E♭:♭7 | 外: A',
      'III7 G7 = G:1 B:3 D:5 F:♭7 | 外: B',
      'IVmM7 A♭mM7 = A♭:1 C♭:♭3 E♭:5 G:7 | 外: C♭',
      'Vm7 B♭m7 = B♭:1 D♭:♭3 F:5 A♭:♭7 | 外: D♭',
      'VI7 C7 = C:1 E:3 G:5 B♭:♭7 | 外: E',
      '♭VIM7 C♭M7 = C♭:1 E♭:3 G♭:5 B♭:7 | 外: C♭ G♭',
      '♭VII7 D♭7 = D♭:1 F:3 A♭:5 C♭:♭7 | 外: D♭ C♭',
    ],
  },
  'B♭': {
    majorPenta: 'B♭:1 C:2 D:3 F:5 G:6',
    minorPenta: 'G: G:1 B♭:♭3 C:4 D:5 F:♭7',
    sevenths: [
      'IM7 B♭M7 = B♭:1 D:3 F:5 A:7',
      'Im7 B♭m7 = B♭:1 D♭:♭3 F:5 A♭:♭7 | 外: D♭ A♭',
      'I7 B♭7 = B♭:1 D:3 F:5 A♭:♭7 | 外: A♭',
      'Im7♭5 B♭m7♭5 = B♭:1 D♭:♭3 F♭:♭5 A♭:♭7 | 外: D♭ F♭ A♭',
    ],
    diatonic: [
      'IM7 B♭M7 = B♭:1 D:3 F:5 A:7',
      'IIm7 Cm7 = C:1 E♭:♭3 G:5 B♭:♭7',
      'IIIm7 Dm7 = D:1 F:♭3 A:5 C:♭7',
      'IVM7 E♭M7 = E♭:1 G:3 B♭:5 D:7',
      'V7 F7 = F:1 A:3 C:5 E♭:♭7',
      'VIm7 Gm7 = G:1 B♭:♭3 D:5 F:♭7',
      'VIIm7♭5 Am7♭5 = A:1 C:♭3 E♭:♭5 G:♭7',
    ],
    nonDiatonic: [
      'I7 B♭7 = B♭:1 D:3 F:5 A♭:♭7 | 外: A♭',
      'II7 C7 = C:1 E:3 G:5 B♭:♭7 | 外: E',
      'III7 D7 = D:1 F♯:3 A:5 C:♭7 | 外: F♯',
      'IVmM7 E♭mM7 = E♭:1 G♭:♭3 B♭:5 D:7 | 外: G♭',
      'Vm7 Fm7 = F:1 A♭:♭3 C:5 E♭:♭7 | 外: A♭',
      'VI7 G7 = G:1 B:3 D:5 F:♭7 | 外: B',
      '♭VIM7 G♭M7 = G♭:1 B♭:3 D♭:5 F:7 | 外: G♭ D♭',
      '♭VII7 A♭7 = A♭:1 C:3 E♭:5 G♭:♭7 | 外: A♭ G♭',
    ],
  },
  'F': {
    majorPenta: 'F:1 G:2 A:3 C:5 D:6',
    minorPenta: 'D: D:1 F:♭3 G:4 A:5 C:♭7',
    sevenths: [
      'IM7 FM7 = F:1 A:3 C:5 E:7',
      'Im7 Fm7 = F:1 A♭:♭3 C:5 E♭:♭7 | 外: A♭ E♭',
      'I7 F7 = F:1 A:3 C:5 E♭:♭7 | 外: E♭',
      'Im7♭5 Fm7♭5 = F:1 A♭:♭3 C♭:♭5 E♭:♭7 | 外: A♭ C♭ E♭',
    ],
    diatonic: [
      'IM7 FM7 = F:1 A:3 C:5 E:7',
      'IIm7 Gm7 = G:1 B♭:♭3 D:5 F:♭7',
      'IIIm7 Am7 = A:1 C:♭3 E:5 G:♭7',
      'IVM7 B♭M7 = B♭:1 D:3 F:5 A:7',
      'V7 C7 = C:1 E:3 G:5 B♭:♭7',
      'VIm7 Dm7 = D:1 F:♭3 A:5 C:♭7',
      'VIIm7♭5 Em7♭5 = E:1 G:♭3 B♭:♭5 D:♭7',
    ],
    nonDiatonic: [
      'I7 F7 = F:1 A:3 C:5 E♭:♭7 | 外: E♭',
      'II7 G7 = G:1 B:3 D:5 F:♭7 | 外: B',
      'III7 A7 = A:1 C♯:3 E:5 G:♭7 | 外: C♯',
      'IVmM7 B♭mM7 = B♭:1 D♭:♭3 F:5 A:7 | 外: D♭',
      'Vm7 Cm7 = C:1 E♭:♭3 G:5 B♭:♭7 | 外: E♭',
      'VI7 D7 = D:1 F♯:3 A:5 C:♭7 | 外: F♯',
      '♭VIM7 D♭M7 = D♭:1 F:3 A♭:5 C:7 | 外: D♭ A♭',
      '♭VII7 E♭7 = E♭:1 G:3 B♭:5 D♭:♭7 | 外: E♭ D♭',
    ],
  },
}

describe('12 キー全件の期待値表（N-04）', () => {
  it('表は 12 キーぶんある', () => {
    expect(Object.keys(TABLE)).toEqual(KEYS.map(formatNote))
  })
  it.each(KEYS.map((k) => [formatNote(k), k] as const))('%s', (name, key) => {
    const row = TABLE[name]
    const minor = relativeMinorPentatonic(key)
    expect(majorPentatonic(key).map(tone).join(' ')).toBe(row.majorPenta)
    expect(`${formatNote(minor.root)}: ${minor.tones.map(tone).join(' ')}`).toBe(row.minorPenta)
    expect(keySevenths(key).map(chord)).toEqual(row.sevenths)
    expect(diatonicChords(key).map(chord)).toEqual(row.diatonic)
    expect(nonDiatonicChords(key).map(chord)).toEqual(row.nonDiatonic)
  })
})
