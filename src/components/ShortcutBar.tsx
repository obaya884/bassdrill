// 画面下部のキー割り当て 1 行（F-502。文言は画面定義書 13 §6）
export const SHORTCUTS: readonly [string, string][] = [
  ['J/K', '節'],
  ['←/→', 'コード'],
  ['Space', '答え・次'],
  ['M', 'ペンタ'],
  ['A', '自動送り'],
  ['+/-', '間隔'],
  ['N', '次のキー'],
  ['?', 'ヘルプ'],
]

export function ShortcutBar() {
  return (
    <footer className="fixed bottom-0 inset-x-0 h-10 bg-surface border-t border-line flex items-center justify-center gap-6 text-[14px] text-muted">
      {SHORTCUTS.map(([k, label]) => (
        <span key={k}>
          <kbd className="text-ink font-semibold">{k}</kbd> {label}
        </span>
      ))}
    </footer>
  )
}

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div role="dialog" aria-label="キー操作" className="fixed inset-0 z-20 flex items-center justify-center bg-bg/80" onClick={onClose}>
      <div className="bg-surface border border-line rounded-xl p-8 min-w-[360px]">
        <h3 className="text-[24px] font-semibold mb-4">キー操作</h3>
        <ul className="space-y-2 text-[18px]">
          {SHORTCUTS.map(([k, label]) => (
            <li key={k} className="flex gap-4">
              <kbd className="text-accent font-semibold w-20">{k}</kbd>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
