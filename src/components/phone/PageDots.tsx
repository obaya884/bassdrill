// ページの点と ‹ ›（画面定義書 13 §8.5。F-601）
type Props = { count: number; index: number; onPrev(): void; onNext(): void }

export function PageDots({ count, index, onPrev, onNext }: Props) {
  return (
    <div className="shrink-0 h-7 flex items-center justify-center gap-3 bg-surface pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <button type="button" aria-label="前の節" disabled={index === 0} onClick={onPrev}
        className="min-w-11 min-h-11 -my-2 text-[20px] text-muted disabled:opacity-30">‹</button>
      <div className="flex gap-2" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={`block w-2 h-2 rounded-full ${i === index ? 'bg-accent' : 'bg-line'}`} />
        ))}
      </div>
      <button type="button" aria-label="次の節" disabled={index === count - 1} onClick={onNext}
        className="min-w-11 min-h-11 -my-2 text-[20px] text-muted disabled:opacity-30">›</button>
    </div>
  )
}
