// 節 3: メジャーペンタ／平行調のマイナーペンタ（F-202）
import { type NoteName, formatNote } from '../../domain/pitch'
import { majorPentatonic, relativeMinorPentatonic, type ScaleTone } from '../../domain/scale'
import { markersFor, type ToneSpec } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'

export type PentaMode = 'major' | 'minor'

function toSpecs(tones: ScaleTone[]): ToneSpec[] {
  return tones.map((t) => ({ note: t.note, label: t.degreeLabel, kind: t.degreeLabel === '1' ? 'root' : 'tone' }))
}

export function PentaSection({ keyNote, mode }: { keyNote: NoteName; mode: PentaMode }) {
  const { root, tones } = mode === 'major'
    ? { root: keyNote, tones: majorPentatonic(keyNote) }
    : relativeMinorPentatonic(keyNote)
  const name = `${formatNote(root)} ${mode === 'major' ? 'メジャーペンタ' : 'マイナーペンタ'}`
  return (
    <div>
      <h3 className="text-[24px] text-muted mb-3">{name}</h3>
      <Fretboard markers={markersFor(toSpecs(tones))} />
    </div>
  )
}
