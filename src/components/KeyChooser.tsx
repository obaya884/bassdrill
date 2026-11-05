// キー選択の中身（F-104）: 12 キーを 5 度圏の順に 4 列 × 3 段、下に「次のキー」。PC のポップオーバーとスマホのシートで共通
import { type NoteName, equalsNote, formatNote } from '../domain/pitch'
import { KEYS } from '../domain/scale'

type Props = { current: NoteName; onSelect(k: NoteName): void; onNext(): void }

export function KeyChooser({ current, onSelect, onNext }: Props) {
  return (
    <div>
      <h3 className="text-[18px] font-semibold mb-4">キーを選ぶ</h3>
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
      <button type="button" onClick={onNext} className="mt-4 w-full min-h-11 rounded-xl bg-surface-raised text-[15px] font-semibold">
        次のキー
      </button>
    </div>
  )
}
