// スケール・ペンタの再生ボタン（F-206。画面定義書 13 §2.2）: 円の枠に ▶ の印だけで文字は無い。音が切のときは薄くして押せない（場所は動かさない）
type Props = { label: string; enabled: boolean; onPlay(): void }

export function PlayButton({ label, enabled, onPlay }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={onPlay}
      className={`w-12 h-12 flex items-center justify-center rounded-full ${enabled ? 'text-accent hover:bg-surface-raised active:bg-surface-raised' : 'text-muted opacity-40'}`}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
        <circle data-part="ring" cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeWidth="2" />
        <path data-part="triangle" d="M15.5 12v16l13-8z" fill="currentColor" />
      </svg>
    </button>
  )
}
