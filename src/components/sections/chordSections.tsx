// 節 4・6・7: ChordSection にそれぞれのコード列を渡す薄い包み（F-301〜F-303）
import { type NoteName } from '../../domain/pitch'
import { diatonicChords, keySevenths, nonDiatonicChords } from '../../domain/progression'
import { ChordSection } from './ChordSection'

/** F-303 のガイド文（画面定義書 13 §6） */
export const NON_DIATONIC_GUIDE =
  'ダイアトニックでないコードは無数にあるが、J-POP・Rock でよく使われるのはこの 8 つ。スケールから外れた音をベースラインに取り入れるとよい'

type Props = { keyNote: NoteName; selected: number }

export function SeventhSection({ keyNote, selected }: Props) {
  return <ChordSection chords={keySevenths(keyNote)} selected={selected} />
}
export function DiatonicSection({ keyNote, selected }: Props) {
  return <ChordSection chords={diatonicChords(keyNote)} selected={selected} />
}
export function NonDiatonicSection({ keyNote, selected }: Props) {
  return <ChordSection chords={nonDiatonicChords(keyNote)} selected={selected} guide={NON_DIATONIC_GUIDE} highlightOutside />
}
