// 音名（文字＋変化記号）とピッチクラス（C=0 〜 B=11）の基礎。
// I/O を持たない純粋関数だけを置く（要件定義書 §2.3）。

export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export const LETTERS: readonly Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

export type Accidental = -2 | -1 | 0 | 1 | 2
export type NoteName = Readonly<{ letter: Letter; accidental: Accidental }>

const NATURAL_PITCH_CLASS: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const ACCIDENTAL_SYMBOL: Record<Accidental, string> = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' }

function toAccidental(n: number): Accidental {
  if (n < -2 || n > 2 || !Number.isInteger(n)) throw new RangeError(`変化記号の範囲外: ${n}`)
  return n as Accidental
}

export function note(letter: Letter, accidental = 0): NoteName {
  return { letter, accidental: toAccidental(accidental) }
}

export function pitchClass(n: NoteName): number {
  return ((NATURAL_PITCH_CLASS[n.letter] + n.accidental) % 12 + 12) % 12
}

export function formatNote(n: NoteName): string {
  return n.letter + ACCIDENTAL_SYMBOL[n.accidental]
}

export function stepLetter(letter: Letter, steps: number): Letter {
  const i = LETTERS.indexOf(letter)
  return LETTERS[((i + steps) % 7 + 7) % 7]
}

/** その文字でピッチクラス pc を表す綴り。変化記号は -2〜2 で最も近いもの */
export function spellFromLetter(letter: Letter, pc: number): NoteName {
  const diff = ((pc - NATURAL_PITCH_CLASS[letter] + 6) % 12 + 12) % 12 - 6
  return note(letter, diff)
}

/** 変化記号 1 つ以内の綴りを、変化記号の少ない順（同数なら ♯ を先）に返す */
export function simpleSpellings(pc: number): NoteName[] {
  const out: NoteName[] = []
  for (const acc of [0, 1, -1] as const) {
    for (const letter of LETTERS) {
      if (((NATURAL_PITCH_CLASS[letter] + acc) % 12 + 12) % 12 === ((pc % 12) + 12) % 12) out.push(note(letter, acc))
    }
  }
  return out
}

export function hasDoubleAccidental(n: NoteName): boolean {
  return Math.abs(n.accidental) === 2
}

export function equalsNote(a: NoteName, b: NoteName): boolean {
  return a.letter === b.letter && a.accidental === b.accidental
}
