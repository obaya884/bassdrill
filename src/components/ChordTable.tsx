// コード一覧（画面定義書 13 §2「コード表」）。選択行の強調と外れ音の強調
import { formatNote, pitchClass } from '../domain/pitch'
import { type LabeledChord } from '../domain/progression'

export function ChordTable({ chords, selected }: { chords: LabeledChord[]; selected: number }) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {chords.map((x, i) => {
          const isSelected = i === selected
          return (
            <tr
              key={x.roman}
              aria-selected={isSelected}
              className={`border-l-[3px] ${isSelected ? 'bg-surface-raised border-accent' : 'border-transparent'}`}
            >
              <td className="px-3 py-2 text-[14px] text-muted w-20 whitespace-nowrap">{x.roman}</td>
              <td className="px-3 py-2 text-[24px] font-bold whitespace-nowrap">{x.chord.name}</td>
              {x.chord.tones.map((t) => {
                const outside = x.outsidePitchClasses.has(pitchClass(t.note))
                return (
                  <td key={t.degreeLabel} data-outside={outside ? 'true' : undefined} className="px-2 py-2 text-center w-14">
                    <div className={`text-[20px] leading-tight ${outside ? 'text-outside underline underline-offset-4' : ''}`}>{formatNote(t.note)}</div>
                    <div className="text-[13px] text-muted leading-tight">{t.degreeLabel}</div>
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
