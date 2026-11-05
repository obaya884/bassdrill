// 節 3: メジャーペンタ／平行調のマイナーペンタ（F-202）
import { type NoteName, formatNote } from '../../domain/pitch'
import { majorPentatonic, relativeMinorPentatonic, type ScaleTone } from '../../domain/scale'
import { markersFor, type ToneSpec } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'
import { FretboardScroller } from '../phone/FretboardScroller'

export type PentaMode = 'major' | 'minor'

function toSpecs(tones: ScaleTone[]): ToneSpec[] {
  return tones.map((t) => ({ note: t.note, label: t.degreeLabel, kind: t.degreeLabel === '1' ? 'root' : 'tone' }))
}

export function PentaSection({ keyNote, mode, compact = false }: { keyNote: NoteName; mode: PentaMode; compact?: boolean }) {
  const { root, tones } = mode === 'major'
    ? { root: keyNote, tones: majorPentatonic(keyNote) }
    : relativeMinorPentatonic(keyNote)
  const name = `${formatNote(root)} ${mode === 'major' ? 'メジャーペンタ' : 'マイナーペンタ'}`
  return (
    <div>
      <h3 className={`text-muted mb-3 ${compact ? 'text-[18px]' : 'text-[24px]'}`}>{name}</h3>
      {compact ? <FretboardScroller><Fretboard markers={markersFor(toSpecs(tones))} /></FretboardScroller> : <Fretboard markers={markersFor(toSpecs(tones))} />}
    </div>
  )
}
