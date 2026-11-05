// 横スワイプとタップの判定（画面定義書 13 §8.5）。Pointer Events で受け、指を離した時点で判定する。
// 追跡中は window で pointerup / pointercancel も受け、帯の外で離しても帯がずれたまま残らないようにする
import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'

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

type Tracking = { id: number; x: number; y: number; target: Element }
type PointerLike = { pointerId: number; clientX: number; clientY: number }

export function useSwipe({ onSwipeLeft, onSwipeRight, onTap, ignoreWithin, threshold = SWIPE_THRESHOLD, onDrag, onRelease }: Options) {
  const tracking = useRef<Tracking | null>(null)
  // 最新のコールバックを ref で持ち、window のリスナーが古いクロージャを掴まないようにする
  const cbs = useRef({ onSwipeLeft, onSwipeRight, onTap, onDrag, onRelease, threshold })
  useEffect(() => {
    cbs.current = { onSwipeLeft, onSwipeRight, onTap, onDrag, onRelease, threshold }
  }, [onSwipeLeft, onSwipeRight, onTap, onDrag, onRelease, threshold])

  // window 側のリスナー（帯の外で離したとき用）。1 回だけ作り、finish から参照する
  const windowHandlers = useRef<{ up(e: PointerEvent): void; cancel(e: PointerEvent): void } | null>(null)

  const finish = useCallback((e: PointerLike, cancelled: boolean) => {
    const t = tracking.current
    if (!t || t.id !== e.pointerId) return
    tracking.current = null
    const wh = windowHandlers.current
    if (wh) {
      window.removeEventListener('pointerup', wh.up)
      window.removeEventListener('pointercancel', wh.cancel)
    }
    const { onSwipeLeft, onSwipeRight, onTap, onRelease, threshold } = cbs.current
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
  }, [])

  if (!windowHandlers.current) {
    windowHandlers.current = { up: (e) => finish(e, false), cancel: (e) => finish(e, true) }
  }

  useEffect(() => () => {
    const wh = windowHandlers.current
    if (!wh) return
    window.removeEventListener('pointerup', wh.up)
    window.removeEventListener('pointercancel', wh.cancel)
  }, [])

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || tracking.current) return
    const target = e.target as Element
    if (ignoreWithin && target.closest(ignoreWithin)) return
    tracking.current = { id: e.pointerId, x: e.clientX, y: e.clientY, target }
    const wh = windowHandlers.current!
    window.addEventListener('pointerup', wh.up)
    window.addEventListener('pointercancel', wh.cancel)
  }, [ignoreWithin])

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const t = tracking.current
    if (!t || t.id !== e.pointerId) return
    const dx = e.clientX - t.x
    const dy = e.clientY - t.y
    if (Math.abs(dx) > Math.abs(dy)) cbs.current.onDrag?.(dx)
  }, [])

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => finish(e, false), [finish])
  const onPointerCancel = useCallback((e: ReactPointerEvent<HTMLElement>) => finish(e, true), [finish])

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel }
}
