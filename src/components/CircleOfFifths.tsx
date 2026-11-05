// 5 度圏。今のキーを強調し、クリックで手動選択（F-103・F-104。画面定義書 13 §4）
import { type NoteName, equalsNote, formatNote } from '../domain/pitch'
import { KEYS } from '../domain/scale'

const SIZE = 80
const R = 28

export function CircleOfFifths({ current, onSelect }: { current: NoteName; onSelect: (key: NoteName) => void }) {
  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }} aria-label="5 度圏">
      {KEYS.map((k, i) => {
        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
        const x = SIZE / 2 + R * Math.cos(angle)
        const y = SIZE / 2 + R * Math.sin(angle)
        const isCurrent = equalsNote(k, current)
        const d = isCurrent ? 28 : 22
        return (
          <button
            key={formatNote(k)}
            type="button"
            aria-label={formatNote(k)}
            data-current={isCurrent ? 'true' : undefined}
            onClick={() => onSelect(k)}
            className={`absolute rounded-full text-[11px] font-semibold leading-none transition-all ${
              isCurrent ? 'bg-accent text-bg' : 'bg-surface-raised text-ink hover:bg-line'
            }`}
            style={{ width: d, height: d, left: x - d / 2, top: y - d / 2 }}
          >
            {formatNote(k)}
          </button>
        )
      })}
    </div>
  )
}
