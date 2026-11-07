// スマホのヘッダー（画面定義書 13 §8.1）: 左にアプリ名、中央にキー（ボタン。F-104）、右端に音の入切（F-506）。補助文言は置かない
// keyName は今のキー（aria-label 用）、label は表示する文字（開いた瞬間はルーレットで回る。F-103）
import { SoundToggle } from '../SoundToggle'

type Props = { keyName: string; label: string; onKeyTap(): void; soundEnabled: boolean; onSoundToggle(): void }

export function PhoneHeader({ keyName, label, onKeyTap, soundEnabled, onSoundToggle }: Props) {
  return (
    <header role="banner" className="relative shrink-0 h-[calc(56px+env(safe-area-inset-top))] bg-surface border-b border-line flex flex-col items-center justify-center pt-[env(safe-area-inset-top)] pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]">
      <div className="absolute left-[max(12px,env(safe-area-inset-left))] top-1/2 -translate-y-1/2 text-[12px] font-semibold text-muted tracking-wide select-none">Bass Drill</div>
      <button
        type="button"
        data-testid="current-key"
        aria-label={`キー ${keyName} を変える`}
        onClick={onKeyTap}
        className="text-[28px] font-bold text-accent leading-none px-3 min-h-9 rounded-lg active:bg-surface-raised"
      >
        {label} <span className="text-[13px] text-muted align-middle">▾</span>
      </button>
      <div className="absolute right-[max(12px,env(safe-area-inset-right))] top-1/2 -translate-y-1/2">
        <SoundToggle enabled={soundEnabled} onToggle={onSoundToggle} />
      </div>
    </header>
  )
}
