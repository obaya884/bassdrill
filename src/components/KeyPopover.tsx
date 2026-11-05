// PC のキー選択の面（F-104。画面定義書 13 §3）: ヘッダーのキーの下に出るポップオーバー。外側クリックで閉じる
import { type NoteName } from '../domain/pitch'
import { KeyChooser } from './KeyChooser'

type Props = { current: NoteName; onSelect(k: NoteName): void; onNext(): void; onClose(): void }

export function KeyPopover({ current, onSelect, onNext, onClose }: Props) {
  return (
    <>
      <div data-testid="popover-backdrop" className="fixed inset-0 z-20" onClick={onClose} />
      <div
        role="dialog"
        aria-label="キーを選ぶ"
        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 w-[320px] bg-surface border border-line rounded-2xl p-4"
      >
        <KeyChooser current={current} onSelect={onSelect} onNext={onNext} />
      </div>
    </>
  )
}
