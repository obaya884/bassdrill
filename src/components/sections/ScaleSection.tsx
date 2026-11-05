// 節 2: メジャースケールを指板に（F-201）
import { type NoteName } from '../../domain/pitch'
import { majorScale } from '../../domain/scale'
import { markersFor, type ToneSpec } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'

function scaleTones(keyNote: NoteName): ToneSpec[] {
  return majorScale(keyNote).map((n, i) => ({ note: n, label: String(i + 1), kind: i === 0 ? 'root' : 'tone' }))
}

export function ScaleSection({ keyNote }: { keyNote: NoteName }) {
  return <Fretboard markers={markersFor(scaleTones(keyNote))} />
}
