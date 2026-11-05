// 節 1: 今のキーを最大の文字で（画面定義書 13 §2。スマホは §8.7 の key-hero-sp＝112px、横持ち 72px）
import { type NoteName, formatNote } from '../../domain/pitch'

export function KeySection({ keyNote, manual, compact = false }: { keyNote: NoteName; manual: boolean; compact?: boolean }) {
  return (
    <div className="flex flex-col items-center py-8">
      <div className={`leading-none font-bold text-accent ${compact ? 'text-[112px] landscape:text-[72px]' : 'text-[160px]'}`}>{formatNote(keyNote)}</div>
      <div className="mt-4 text-[14px] text-muted">{manual ? '手で選んだキー' : '今日のキー'}</div>
    </div>
  )
}
