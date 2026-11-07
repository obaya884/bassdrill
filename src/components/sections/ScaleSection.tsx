// スケールの節: メジャースケールを指板に（F-201）。再生ボタン（F-206）は PC では見出しの行（DesktopApp が置く）、スマホでは指板の下に中央揃え
import { type NoteName } from '../../domain/pitch'
import { majorScale } from '../../domain/scale'
import { markersFor, type ToneSpec } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'
import { FretboardScroller } from '../phone/FretboardScroller'
import { PlayButton } from '../PlayButton'

function scaleTones(keyNote: NoteName): ToneSpec[] {
  return majorScale(keyNote).map((n, i) => ({ note: n, label: String(i + 1), kind: i === 0 ? 'root' : 'tone' }))
}

type Props = { keyNote: NoteName; soundEnabled: boolean; onPlay(): void; compact?: boolean }

export function ScaleSection({ keyNote, soundEnabled, onPlay, compact = false }: Props) {
  const fb = <Fretboard markers={markersFor(scaleTones(keyNote))} />
  if (!compact) return fb
  return (
    <div>
      <FretboardScroller>{fb}</FretboardScroller>
      <div className="flex justify-center mt-3"><PlayButton label="スケールを再生" enabled={soundEnabled} onPlay={onPlay} /></div>
    </div>
  )
}
