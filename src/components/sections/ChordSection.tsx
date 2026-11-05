// 節 4・6・7 の共通部: 左にコード表、右に選択コードの指板（画面定義書 13 §2）
import { pitchClass } from '../../domain/pitch'
import { type LabeledChord } from '../../domain/progression'
import { markersFor, type ToneSpec } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'
import { ChordTable } from '../ChordTable'
import { FretboardScroller } from '../phone/FretboardScroller'

function chordTones(x: LabeledChord, highlightOutside: boolean): ToneSpec[] {
  return x.chord.tones.map((t, i) => {
    const outside = highlightOutside && x.outsidePitchClasses.has(pitchClass(t.note))
    return { note: t.note, label: t.degreeLabel, kind: outside ? 'outside' : i === 0 ? 'root' : 'tone', isRoot: i === 0 }
  })
}

type Props = {
  chords: LabeledChord[]
  selected: number
  guide?: string
  /** 外れ音を強調するか（節 7 だけ。F-303） */
  highlightOutside?: boolean
  /** スマホ用: 表を上・指板を下に縦に積み、指板は横スクロール（13 §8.2） */
  compact?: boolean
  onSelect?(index: number): void
}

export function ChordSection({ chords, selected, guide, highlightOutside = false, compact = false, onSelect }: Props) {
  const current = chords[Math.min(selected, chords.length - 1)]
  const fretboard = <Fretboard markers={markersFor(chordTones(current, highlightOutside))} />
  return (
    <div>
      {guide && <p className="text-[14px] text-muted mb-4">{guide}</p>}
      {compact ? (
        <div className="space-y-3">
          <ChordTable chords={chords} selected={selected} highlightOutside={highlightOutside} compact onSelect={onSelect} />
          <FretboardScroller>{fretboard}</FretboardScroller>
        </div>
      ) : (
        <div className="grid grid-cols-[2fr_3fr] gap-6 items-start">
          <ChordTable chords={chords} selected={selected} highlightOutside={highlightOutside} />
          {fretboard}
        </div>
      )}
    </div>
  )
}
