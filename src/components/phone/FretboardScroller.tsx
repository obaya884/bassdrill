// 指板を横スクロールの箱に入れる（F-603。画面定義書 13 §8.3）。箱の中で始まったタッチはページ送りにしない
import { type ReactNode } from 'react'

export function FretboardScroller({ children }: { children: ReactNode }) {
  return (
    <div
      data-fretboard-scroll
      data-testid="fretboard-scroll"
      className="overflow-x-auto -mx-3 px-3"
      style={{ touchAction: 'pan-x pan-y' }}
    >
      <div className="min-w-[820px]">{children}</div>
    </div>
  )
}
