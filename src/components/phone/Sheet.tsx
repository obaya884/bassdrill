// 画面下から出るシートの外枠（画面定義書 13 §8.6）。背景タップで閉じる（キーボードは使わない。F-502）
import { type ReactNode } from 'react'

export function Sheet({ label, onClose, children }: { label: string; onClose(): void; children: ReactNode }) {
  return (
    <div data-testid="sheet-backdrop" className="fixed inset-0 z-20 bg-bg/80 flex items-end" onClick={onClose}>
      <div
        role="dialog"
        aria-label={label}
        aria-modal="true"
        className="w-full bg-surface rounded-t-2xl border-t border-line px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
