// 節 1: 今のキーを最大の文字で（画面定義書 13 §2）
import { type NoteName, formatNote } from '../../domain/pitch'

export function KeySection({ keyNote, manual }: { keyNote: NoteName; manual: boolean }) {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="text-[160px] leading-none font-bold text-accent">{formatNote(keyNote)}</div>
      <div className="mt-4 text-[14px] text-muted">{manual ? '手で選んだキー' : '今日のキー'}</div>
    </div>
  )
}
