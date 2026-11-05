// 自動送りの間隔シート（F-602・F-404）: − ＋ で 2〜15 秒
import { Sheet } from './Sheet'

export function IntervalSheet({ value, onChange, onClose }: { value: number; onChange(n: number): void; onClose(): void }) {
  return (
    <Sheet label="自動送りの間隔" onClose={onClose}>
      <div className="flex items-center justify-center gap-6">
        <button type="button" aria-label="間隔を減らす" onClick={() => onChange(value - 1)} className="w-16 h-16 rounded-xl bg-surface-raised text-[28px] font-bold">−</button>
        <div className="text-[32px] font-semibold w-24 text-center">{`${value} 秒`}</div>
        <button type="button" aria-label="間隔を増やす" onClick={() => onChange(value + 1)} className="w-16 h-16 rounded-xl bg-surface-raised text-[28px] font-bold">＋</button>
      </div>
    </Sheet>
  )
}
