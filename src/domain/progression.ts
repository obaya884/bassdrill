// セブンス 4 種・ダイアトニック 7・ノンダイアトニック 8（F-301〜F-303）
import { type NoteName, note, pitchClass } from './pitch'
import { majorScale, scalePitchClasses } from './scale'
import { buildChord, type Chord, type ChordQuality } from './chord'

export type LabeledChord = Readonly<{
  roman: string
  chord: Chord
  /** スケールに無い構成音のピッチクラス（外れ音。F-303） */
  outsidePitchClasses: Set<number>
}>

function label(key: NoteName, roman: string, root: NoteName, quality: ChordQuality): LabeledChord {
  const chord = buildChord(root, quality)
  const inScale = scalePitchClasses(key)
  const outsidePitchClasses = new Set(chord.tones.map((t) => pitchClass(t.note)).filter((pc) => !inScale.has(pc)))
  return { roman, chord, outsidePitchClasses }
}

/** 根音をキーの音に固定した M7 → m7 → 7 → m7♭5（レッスンの順。F-301） */
export function keySevenths(key: NoteName): LabeledChord[] {
  const qualities: ChordQuality[] = ['M7', 'm7', '7', 'm7b5']
  const romans = ['IM7', 'Im7', 'I7', 'Im7♭5']
  return qualities.map((q, i) => label(key, romans[i], key, q))
}

const DIATONIC_QUALITIES: ChordQuality[] = ['M7', 'm7', 'm7', 'M7', '7', 'm7', 'm7b5']
const DIATONIC_ROMANS = ['IM7', 'IIm7', 'IIIm7', 'IVM7', 'V7', 'VIm7', 'VIIm7♭5']

/** スケールの各音を根音にしたセブンスコード 7 つ（F-302） */
export function diatonicChords(key: NoteName): LabeledChord[] {
  const s = majorScale(key)
  return DIATONIC_QUALITIES.map((q, i) => label(key, DIATONIC_ROMANS[i], s[i], q))
}

/** 下げた根音（♭VI・♭VII）。スケールの文字を ♭ で 1 つ下げる */
function flattened(n: NoteName): NoteName {
  return note(n.letter, n.accidental - 1)
}

/** J-POP・Rock でよく使われる 8 つ（レッスンのホワイトボードの順。F-303） */
export function nonDiatonicChords(key: NoteName): LabeledChord[] {
  const s = majorScale(key)
  const spec: [string, NoteName, ChordQuality][] = [
    ['I7', s[0], '7'],
    ['II7', s[1], '7'],
    ['III7', s[2], '7'],
    ['IVmM7', s[3], 'mM7'],
    ['Vm7', s[4], 'm7'],
    ['VI7', s[5], '7'],
    ['♭VIM7', flattened(s[5]), 'M7'],
    ['♭VII7', flattened(s[6]), '7'],
  ]
  return spec.map(([roman, root, q]) => label(key, roman, root, q))
}
