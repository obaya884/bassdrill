// 節の外枠。フォーカス時に拡大し画面縦中央へ、非フォーカス時は減光・縮小（画面定義書 13 §3）
import { useEffect, useRef, type ReactNode } from 'react'

type Props = { id: string; title: string; focused: boolean; index: number; children?: ReactNode; aside?: ReactNode }

export function Section({ id, title, focused, index, children, aside }: Props) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [focused])
  return (
    <section
      ref={ref}
      id={`section-${id}`}
      data-focused={focused ? 'true' : undefined}
      aria-current={focused ? 'true' : undefined}
      className={`transition-[opacity,transform] duration-200 ease-out origin-top ${focused ? 'opacity-100 scale-100' : 'opacity-35 scale-[0.92]'}`}
    >
      <div className="flex items-baseline gap-4 mb-4">
        <h2 className={`font-semibold ${focused ? 'text-[32px]' : 'text-[24px]'}`}>
          {index + 1} {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
