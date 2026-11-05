// 4 弦ベース（上から G D A E）の指板上の音の位置（F-201・F-203）
import { type NoteName, pitchClass } from './pitch'

export const STRINGS: readonly { name: 'G' | 'D' | 'A' | 'E'; openPitchClass: number }[] = [
  { name: 'G', openPitchClass: 7 },
  { name: 'D', openPitchClass: 2 },
  { name: 'A', openPitchClass: 9 },
  { name: 'E', openPitchClass: 4 },
]
export const FRET_COUNT = 12
export const MARKER_FRETS = [3, 5, 7, 9, 12] as const

export type MarkerKind = 'root' | 'tone' | 'outside'
export type ToneSpec = Readonly<{ note: NoteName; label: string; kind: MarkerKind }>
/** string は 0=G 〜 3=E */
export type Marker = Readonly<{ string: number; fret: number; note: NoteName; label: string; kind: MarkerKind }>

/** 各弦・各フレット 0〜12 で、ピッチクラスが一致する tone をマーカーにする。弦順・フレット順 */
export function markersFor(tones: ToneSpec[]): Marker[] {
  const byPc = new Map<number, ToneSpec>()
  for (const t of tones) byPc.set(pitchClass(t.note), t)
  const out: Marker[] = []
  STRINGS.forEach((s, string) => {
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const t = byPc.get((s.openPitchClass + fret) % 12)
      if (t) out.push({ string, fret, note: t.note, label: t.label, kind: t.kind })
    }
  })
  return out
}
