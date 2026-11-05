// セブンスコードの構成音と綴り（F-301・F-305）
import {
  type NoteName, formatNote, hasDoubleAccidental, pitchClass, simpleSpellings, spellFromLetter, stepLetter,
} from './pitch'

export type ChordQuality = 'M7' | 'm7' | '7' | 'm7b5' | 'mM7'

export const QUALITY_SUFFIX: Record<ChordQuality, string> = { M7: 'M7', m7: 'm7', '7': '7', m7b5: 'm7♭5', mM7: 'mM7' }

const QUALITY_SPEC: Record<ChordQuality, { semitones: readonly number[]; labels: readonly string[] }> = {
  M7: { semitones: [0, 4, 7, 11], labels: ['1', '3', '5', '7'] },
  m7: { semitones: [0, 3, 7, 10], labels: ['1', '♭3', '5', '♭7'] },
  '7': { semitones: [0, 4, 7, 10], labels: ['1', '3', '5', '♭7'] },
  m7b5: { semitones: [0, 3, 6, 10], labels: ['1', '♭3', '♭5', '♭7'] },
  mM7: { semitones: [0, 3, 7, 11], labels: ['1', '♭3', '5', '7'] },
}

export type ChordTone = Readonly<{ note: NoteName; degreeLabel: string }>
export type Chord = Readonly<{ root: NoteName; quality: ChordQuality; tones: ChordTone[]; name: string }>

/** 根音の文字から 3 度ずつ文字を進めて綴る。ダブル変化記号が出なければそのまま返す */
function spellTones(root: NoteName, quality: ChordQuality): ChordTone[] {
  const { semitones, labels } = QUALITY_SPEC[quality]
  const base = pitchClass(root)
  return semitones.map((iv, i) => ({
    note: spellFromLetter(stepLetter(root.letter, 2 * i), (base + iv) % 12),
    degreeLabel: labels[i],
  }))
}

/**
 * コードを組み立てる。綴りにダブル変化記号が含まれるときは、根音を同じ高さの
 * 変化記号 1 つ以内の綴りに読み替えてから綴り直す（F-305）。
 */
export function buildChord(root: NoteName, quality: ChordQuality): Chord {
  const candidates = [root, ...simpleSpellings(pitchClass(root))]
  for (const r of candidates) {
    let tones: ChordTone[]
    try {
      tones = spellTones(r, quality)
    } catch {
      continue // 文字送りでは ±2 に収まらない綴り
    }
    if (tones.some((t) => hasDoubleAccidental(t.note))) continue
    return { root: r, quality, tones, name: formatNote(r) + QUALITY_SUFFIX[quality] }
  }
  throw new Error(`綴れないコード: ${formatNote(root)} ${quality}`)
}
