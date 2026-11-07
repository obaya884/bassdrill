// ペンタの節: メジャーペンタ／平行調のマイナーペンタ（F-202）。切り替えは節の中のボタン。再生ボタン（F-206）は PC では切り替えの右、スマホでは切り替えごと指板の下に中央揃え（指板 → 切り替え → 再生）
import { type NoteName, formatNote } from '../../domain/pitch'
import { majorPentatonic, relativeMinorPentatonic, type PentaMode, type ScaleTone } from '../../domain/scale'
import { markersFor, type ToneSpec } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'
import { FretboardScroller } from '../phone/FretboardScroller'
import { PlayButton } from '../PlayButton'

function toSpecs(tones: ScaleTone[]): ToneSpec[] {
  return tones.map((t) => ({ note: t.note, label: t.degreeLabel, kind: t.degreeLabel === '1' ? 'root' : 'tone' }))
}

type Props = { keyNote: NoteName; mode: PentaMode; onToggle(): void; soundEnabled: boolean; onPlay(): void; compact?: boolean }

export function PentaSection({ keyNote, mode, onToggle, soundEnabled, onPlay, compact = false }: Props) {
  const { root, tones } = mode === 'major'
    ? { root: keyNote, tones: majorPentatonic(keyNote) }
    : relativeMinorPentatonic(keyNote)
  const name = `${formatNote(root)} ${mode === 'major' ? 'メジャーペンタ' : 'マイナーペンタ'}`
  const fretboard = <Fretboard markers={markersFor(toSpecs(tones))} />
  const toggle = (
    <button type="button" onClick={onToggle} className={`rounded-xl bg-surface-raised font-semibold ${compact ? 'min-h-11 px-3 text-[13px]' : 'h-9 px-3 text-[13px]'}`}>
      メジャー / マイナー
    </button>
  )
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <h3 className={`text-muted ${compact ? 'text-[15px]' : 'text-[20px]'}`}>{name}</h3>
        {!compact && toggle}
        {!compact && <PlayButton label="ペンタを再生" enabled={soundEnabled} onPlay={onPlay} />}
      </div>
      {compact ? <FretboardScroller>{fretboard}</FretboardScroller> : fretboard}
      {/* スマホは指板 → 切り替え → 再生の順に中央揃え（13 §8.2） */}
      {compact && (
        <div className="flex flex-col items-center gap-3 mt-3">
          {toggle}
          <PlayButton label="ペンタを再生" enabled={soundEnabled} onPlay={onPlay} />
        </div>
      )}
    </div>
  )
}
