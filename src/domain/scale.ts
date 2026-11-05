// 12 キー・メジャースケール・ペンタトニック（F-103・F-105・F-201・F-202）
import { type NoteName, note, pitchClass, spellFromLetter, stepLetter } from './pitch'

/** 5 度圏の順（要件定義書 F-103）。6 つの ♯/♭ のキーは G♭ と綴る（F-105） */
export const KEYS: readonly NoteName[] = [
  note('C'), note('G'), note('D'), note('A'), note('E'), note('B'),
  note('G', -1), note('D', -1), note('A', -1), note('E', -1), note('B', -1), note('F'),
]

/** 5 度圏を時計回りに 1 つ進めたキー（完全 5 度上。F の次は C）。「次のキー」の規則（F-102）。KEYS に無い綴りは同じ高さのキーとして扱う */
export function nextOnCircle(key: NoteName): NoteName {
  const i = KEYS.findIndex((k) => pitchClass(k) === pitchClass(key))
  return KEYS[(i + 1) % KEYS.length]
}

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const

export type ScaleTone = Readonly<{ note: NoteName; degreeLabel: string }>

/** メジャースケール 7 音。文字を 1 つずつ進めて綴る（F-105） */
export function majorScale(key: NoteName): NoteName[] {
  const root = pitchClass(key)
  return MAJOR_INTERVALS.map((iv, i) => spellFromLetter(stepLetter(key.letter, i), (root + iv) % 12))
}

export function scalePitchClasses(key: NoteName): Set<number> {
  return new Set(majorScale(key).map(pitchClass))
}

/** スケールの 1・2・3・5・6 */
export function majorPentatonic(key: NoteName): ScaleTone[] {
  const s = majorScale(key)
  return [0, 1, 2, 4, 5].map((i) => ({ note: s[i], degreeLabel: String(i + 1) }))
}

/** 平行調のマイナーペンタ。音はメジャーペンタと同じで、根音は 6 度の音（F-202） */
export function relativeMinorPentatonic(key: NoteName): { root: NoteName; tones: ScaleTone[] } {
  const s = majorScale(key)
  const idx = [5, 0, 1, 2, 4] // 6 度を根音に、1 ♭3 4 5 ♭7
  const labels = ['1', '♭3', '4', '5', '♭7']
  return { root: s[5], tones: idx.map((i, k) => ({ note: s[i], degreeLabel: labels[k] })) }
}
