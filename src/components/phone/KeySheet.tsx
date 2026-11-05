// キー選択シート（F-604）: 12 キーを 5 度圏の順に 4 列 × 3 段
import { type NoteName, equalsNote, formatNote } from '../../domain/pitch'
import { KEYS } from '../../domain/scale'
import { Sheet } from './Sheet'

export function KeySheet({ current, onSelect, onClose }: { current: NoteName; onSelect(k: NoteName): void; onClose(): void }) {
  return (
    <Sheet label="キーを選ぶ" onClose={onClose}>
      <div className="grid grid-cols-4 gap-3">
        {KEYS.map((k) => {
          const isCurrent = equalsNote(k, current)
          return (
            <button
              key={formatNote(k)}
              type="button"
              aria-label={formatNote(k)}
              data-current={isCurrent ? 'true' : undefined}
              onClick={() => onSelect(k)}
              className={`h-16 rounded-xl text-[22px] font-bold ${isCurrent ? 'bg-accent text-bg' : 'bg-surface-raised text-ink'}`}
            >
              {formatNote(k)}
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
