// 横スワイプとタップの判定（画面定義書 13 §8.5）。Pointer Events で受け、指を離した時点で判定する
import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'

export const SWIPE_THRESHOLD = 48

type Options = {
  onSwipeLeft(): void
  onSwipeRight(): void
  /** 48px 未満の動きで離したとき。引数は pointerdown の対象 */
  onTap?(target: Element): void
  /** この selector の中で始まった動きは無視する（指板のスクロールなど） */
  ignoreWithin?: string
  threshold?: number
  /** 追随用。横移動 dx を毎回渡す */
  onDrag?(dx: number): void
  /** 指を離した／キャンセルされたとき */
  onRelease?(): void
}

type Tracking = { id: number; x: number; y: number; target: Element; dx: number; dy: number }

export function useSwipe({ onSwipeLeft, onSwipeRight, onTap, ignoreWithin, threshold = SWIPE_THRESHOLD, onDrag, onRelease }: Options) {
  const tracking = useRef<Tracking | null>(null)

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const target = e.target as Element
    if (ignoreWithin && target.closest(ignoreWithin)) return
    tracking.current = { id: e.pointerId, x: e.clientX, y: e.clientY, target, dx: 0, dy: 0 }
  }, [ignoreWithin])

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const t = tracking.current
    if (!t || t.id !== e.pointerId) return
    t.dx = e.clientX - t.x
    t.dy = e.clientY - t.y
    if (Math.abs(t.dx) > Math.abs(t.dy)) onDrag?.(t.dx)
  }, [onDrag])

  const finish = useCallback((e: ReactPointerEvent<HTMLElement>, cancelled: boolean) => {
    const t = tracking.current
    if (!t || t.id !== e.pointerId) return
    tracking.current = null
    const dx = e.clientX - t.x
    const dy = e.clientY - t.y
    onRelease?.()
    if (cancelled) return
    if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    } else if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      onTap?.(t.target)
    }
  }, [onSwipeLeft, onSwipeRight, onTap, onRelease, threshold])

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => finish(e, false), [finish])
  const onPointerCancel = useCallback((e: ReactPointerEvent<HTMLElement>) => finish(e, true), [finish])

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel }
}
