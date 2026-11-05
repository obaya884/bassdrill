// 節 4・6・7: ChordSection にそれぞれのコード列を渡す薄い包み（F-301〜F-303）
import { type NoteName } from '../../domain/pitch'
import { diatonicChords, keySevenths, nonDiatonicChords } from '../../domain/progression'
import { ChordSection } from './ChordSection'
import { NON_DIATONIC_GUIDE } from '../../app/sections'

type Props = { keyNote: NoteName; selected: number; compact?: boolean; onSelect?(index: number): void }

export function SeventhSection({ keyNote, selected, compact, onSelect }: Props) {
  return <ChordSection chords={keySevenths(keyNote)} selected={selected} compact={compact} onSelect={onSelect} />
}
export function DiatonicSection({ keyNote, selected, compact, onSelect }: Props) {
  return <ChordSection chords={diatonicChords(keyNote)} selected={selected} compact={compact} onSelect={onSelect} />
}
export function NonDiatonicSection({ keyNote, selected, compact, onSelect }: Props) {
  return <ChordSection chords={nonDiatonicChords(keyNote)} selected={selected} guide={NON_DIATONIC_GUIDE} highlightOutside compact={compact} onSelect={onSelect} />
}
