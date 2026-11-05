// キー選択の中身（F-103・F-104。画面定義書 13 §3）: 12 キーを 5 度圏の円に並べ、中央に今のキー、下に「次のキー」。
// 今日のキーは色（accent の塗り）、今のキーは大きさと枠で示す。PC のポップオーバーとスマホのシートで共通
import { type NoteName, equalsNote, formatNote } from '../domain/pitch'
import { KEYS } from '../domain/scale'

const SIZE = 300
const R = 122
const BUTTON = 48
const BUTTON_CURRENT = 56

type Props = { current: NoteName; today: NoteName; onSelect(k: NoteName): void; onNext(): void }

export function KeyChooser({ current, today, onSelect, onNext }: Props) {
  return (
    <div className="flex flex-col items-center">
      <h3 className="self-start text-[18px] font-semibold mb-3">キーを選ぶ</h3>
      <div role="group" aria-label="5 度圏" className="relative" style={{ width: SIZE, height: SIZE }}>
        <div
          data-testid="circle-center"
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-[40px] font-bold text-accent pointer-events-none"
        >
          {formatNote(current)}
        </div>
        {KEYS.map((k, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2 // 12 時が C、時計回り
          const x = SIZE / 2 + R * Math.cos(angle)
          const y = SIZE / 2 + R * Math.sin(angle)
          const isCurrent = equalsNote(k, current)
          const isToday = equalsNote(k, today)
          const d = isCurrent ? BUTTON_CURRENT : BUTTON
          const fill = isToday ? 'bg-accent text-bg' : 'bg-surface-raised text-ink hover:bg-line'
          const frame = isCurrent ? 'border-3 border-ink' : ''
          return (
            <button
              key={formatNote(k)}
              type="button"
              aria-label={formatNote(k)}
              data-current={isCurrent ? 'true' : undefined}
              data-today={isToday ? 'true' : undefined}
              onClick={() => onSelect(k)}
              className={`absolute rounded-full text-[20px] font-bold leading-none ${fill} ${frame}`}
              style={{ width: d, height: d, left: x - d / 2, top: y - d / 2 }}
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
