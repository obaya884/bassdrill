// 節 4・6・7 の共通部: 左にコード表、右に選択コードの指板（画面定義書 13 §2）
import { pitchClass } from '../../domain/pitch'
import { type LabeledChord } from '../../domain/progression'
import { markersFor, type ToneSpec } from '../../domain/fretboard'
import { Fretboard } from '../Fretboard'
import { ChordTable } from '../ChordTable'

export function chordTones(x: LabeledChord): ToneSpec[] {
  return x.chord.tones.map((t, i) => ({
    note: t.note,
    label: t.degreeLabel,
    kind: i === 0 ? 'root' : x.outsidePitchClasses.has(pitchClass(t.note)) ? 'outside' : 'tone',
  }))
}

export function ChordSection({ chords, selected, guide }: { chords: LabeledChord[]; selected: number; guide?: string }) {
  const current = chords[Math.min(selected, chords.length - 1)]
  return (
    <div>
      {guide && <p className="text-[14px] text-muted mb-4">{guide}</p>}
      <div className="grid grid-cols-[2fr_3fr] gap-6 items-start">
        <ChordTable chords={chords} selected={selected} />
        <Fretboard markers={markersFor(chordTones(current))} />
      </div>
    </div>
  )
}
