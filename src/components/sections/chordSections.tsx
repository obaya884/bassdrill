// セブンス・ダイアトニック・ノンダイアトニックの節: ChordSection にそれぞれのコード列を渡す薄い包み（F-301〜F-303）
import { type NoteName } from '../../domain/pitch'
import { diatonicChords, keySevenths, nonDiatonicChords } from '../../domain/progression'
import { ChordSection } from './ChordSection'

/** ノンダイアトニックの節のガイド文（F-303。画面定義書 13 §6） */
const NON_DIATONIC_GUIDE =
  'ダイアトニックでないコードは無数にあるが、J-POP・Rock でよく使われるのはこの 8 つ。スケールから外れた音をベースラインに取り入れるとよい'

type Props = { keyNote: NoteName; selected: number; compact?: boolean; onSelect(index: number): void }

export function SeventhSection({ keyNote, selected, compact, onSelect }: Props) {
  return <ChordSection chords={keySevenths(keyNote)} selected={selected} compact={compact} onSelect={onSelect} />
}
export function DiatonicSection({ keyNote, selected, compact, onSelect }: Props) {
  return <ChordSection chords={diatonicChords(keyNote)} selected={selected} compact={compact} onSelect={onSelect} />
}
export function NonDiatonicSection({ keyNote, selected, compact, onSelect }: Props) {
  return <ChordSection chords={nonDiatonicChords(keyNote)} selected={selected} guide={NON_DIATONIC_GUIDE} highlightOutside compact={compact} onSelect={onSelect} />
}
