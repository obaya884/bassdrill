// スマホのヘッダー（画面定義書 13 §8.1）: 中央にキー（ボタン。F-104）と、その下に補助文言
type Props = { keyName: string; manual: boolean; onKeyTap(): void }

export function PhoneHeader({ keyName, manual, onKeyTap }: Props) {
  return (
    <header className="shrink-0 h-[calc(56px+env(safe-area-inset-top))] bg-surface border-b border-line flex flex-col items-center justify-center pt-[env(safe-area-inset-top)] pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]">
      <button
        type="button"
        data-testid="current-key"
        aria-label={`キー ${keyName} を変える`}
        onClick={onKeyTap}
        className="text-[28px] font-bold text-accent leading-none px-3 min-h-9 rounded-lg active:bg-surface-raised"
      >
        {keyName} <span className="text-[13px] text-muted align-middle">▾</span>
      </button>
      <div className="text-[11px] text-muted leading-none">{manual ? '手で選んだキー' : '今日のキー'}</div>
    </header>
  )
}
