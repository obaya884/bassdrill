// スマホのヘッダー（画面定義書 13 §8.1）: 現在地・キー（ボタン。F-604）・順列の位置
type Props = { title: string; keyName: string; keyOffset: number; onKeyTap(): void }

export function PhoneHeader({ title, keyName, keyOffset, onKeyTap }: Props) {
  return (
    <header className="shrink-0 h-[calc(56px+env(safe-area-inset-top))] bg-surface border-b border-line flex items-center justify-between pt-[env(safe-area-inset-top)] pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]">
      <div className="text-[13px] text-muted w-28 truncate">{title}</div>
      <button
        type="button"
        data-testid="current-key"
        aria-label={`キー ${keyName} を変える`}
        onClick={onKeyTap}
        className="text-[28px] font-bold text-accent leading-none px-3 min-h-11 rounded-lg active:bg-surface-raised"
      >
        {keyName}
      </button>
      <div className="text-[13px] text-muted w-28 text-right">{`${keyOffset + 1} / 12`}</div>
    </header>
  )
}
