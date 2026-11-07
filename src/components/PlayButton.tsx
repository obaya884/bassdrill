// スケール・ペンタの再生ボタン（F-206。画面定義書 13 §2.2）: ▶ の印だけで文字は無い。音が切のときは薄くして押せない（場所は動かさない）
type Props = { label: string; enabled: boolean; onPlay(): void }

export function PlayButton({ label, enabled, onPlay }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={onPlay}
      className={`w-11 h-11 flex items-center justify-center rounded-lg ${enabled ? 'text-accent hover:bg-surface-raised active:bg-surface-raised' : 'text-muted opacity-40'}`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
        <path d="M4 2.5v13l11-6.5z" />
      </svg>
    </button>
  )
}
