// ペンタの節: メジャーペンタ／平行調のマイナーペンタ（F-202）。切り替えは節の中のボタン
import { type NoteName, formatNote } from '../../domain/pitch'
import { majorPentatonic, relativeMinorPentatonic, type ScaleTone } from '../../domain/scale'
import { markersFor, type ToneSpec } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'
import { FretboardScroller } from '../phone/FretboardScroller'

export type PentaMode = 'major' | 'minor'

function toSpecs(tones: ScaleTone[]): ToneSpec[] {
  return tones.map((t) => ({ note: t.note, label: t.degreeLabel, kind: t.degreeLabel === '1' ? 'root' : 'tone' }))
}

type Props = { keyNote: NoteName; mode: PentaMode; onToggle(): void; compact?: boolean }

export function PentaSection({ keyNote, mode, onToggle, compact = false }: Props) {
  const { root, tones } = mode === 'major'
    ? { root: keyNote, tones: majorPentatonic(keyNote) }
    : relativeMinorPentatonic(keyNote)
  const name = `${formatNote(root)} ${mode === 'major' ? 'メジャーペンタ' : 'マイナーペンタ'}`
  const fretboard = <Fretboard markers={markersFor(toSpecs(tones))} />
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <h3 className={`text-muted ${compact ? 'text-[18px]' : 'text-[28px]'}`}>{name}</h3>
        <button type="button" onClick={onToggle} className="min-h-11 px-4 rounded-xl bg-surface-raised text-[15px] font-semibold">
          メジャー / マイナー
        </button>
      </div>
      {compact ? <FretboardScroller>{fretboard}</FretboardScroller> : fretboard}
    </div>
  )
}
