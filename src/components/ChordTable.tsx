// コード一覧（画面定義書 13 §2「コード表」、スマホは §8.4）。選択行の強調と外れ音の強調
import { formatNote, pitchClass } from '../domain/pitch'
import { type LabeledChord } from '../domain/progression'

type Props = {
  chords: LabeledChord[]
  selected: number
  /** 外れ音を強調するか（節 7 だけ。F-303） */
  highlightOutside?: boolean
  /** スマホ用: 音名だけを出し、コード度数は選択行だけ。行はタップで選ぶ（F-605・F-602） */
  compact?: boolean
  onSelect?(index: number): void
}

export function ChordTable({ chords, selected, highlightOutside = false, compact = false, onSelect }: Props) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {chords.map((x, i) => {
          const isSelected = i === selected
          return (
            <tr
              key={x.roman}
              aria-selected={isSelected}
              onClick={onSelect ? () => onSelect(i) : undefined}
              className={`border-l-[3px] ${isSelected ? 'bg-surface-raised border-accent' : 'border-transparent'} ${compact ? 'min-h-11' : ''}`}
            >
              <td className={`text-muted whitespace-nowrap ${compact ? 'px-2 py-1.5 text-[12px] w-14' : 'px-3 py-2 text-[14px] w-20'}`}>{x.roman}</td>
              <td className={`font-bold whitespace-nowrap ${compact ? 'px-2 py-1.5 text-[20px]' : 'px-3 py-2 text-[24px]'}`}>{x.chord.name}</td>
              {x.chord.tones.map((t) => {
                const outside = highlightOutside && x.outsidePitchClasses.has(pitchClass(t.note))
                const showDegree = !compact || isSelected
                return (
                  <td key={t.degreeLabel} data-outside={outside ? 'true' : undefined} className={`text-center ${compact ? 'px-1 py-1.5 w-10' : 'px-2 py-2 w-14'}`}>
                    <div className={`leading-tight ${compact ? 'text-[17px]' : 'text-[20px]'} ${outside ? 'text-outside underline underline-offset-4' : ''}`}>{formatNote(t.note)}</div>
                    {showDegree && <div className="text-[13px] text-muted leading-tight">{t.degreeLabel}</div>}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
