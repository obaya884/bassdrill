// 音の入切ボタン（F-506。画面定義書 13 §1.1）: スピーカーの印だけで文字は無い。切は斜線（muted）、入は音の波の弧（accent）
type Props = { enabled: boolean; onToggle(): void }

export function SoundToggle({ enabled, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-label="音の入切"
      aria-pressed={enabled}
      data-state={enabled ? 'on' : 'off'}
      onClick={onToggle}
      className={`w-11 h-11 flex items-center justify-center rounded-lg hover:bg-surface-raised active:bg-surface-raised ${enabled ? 'text-accent' : 'text-muted'}`}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* スピーカー: 左の四角と右の台形 */}
        <path d="M3 8h4l5-4v14l-5-4H3z" />
        {enabled ? (
          <g data-part="wave">
            <path d="M15 8a4 4 0 0 1 0 6" />
            <path d="M17.5 5.5a7.5 7.5 0 0 1 0 11" />
          </g>
        ) : (
          <path data-part="slash" d="M19 4 3 19" />
        )}
      </svg>
    </button>
  )
}
