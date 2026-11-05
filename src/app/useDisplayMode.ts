// 表示モードの判定（F-601・F-606）。幅 1024 未満、またはタッチ主体（pointer: coarse）ならスマホ表示
import { useSyncExternalStore } from 'react'

export type DisplayMode = 'desktop' | 'phone'

export const PHONE_MAX_WIDTH = 1024
const COARSE_QUERY = '(pointer: coarse)'

export function isPhone(width: number, coarse: boolean): boolean {
  return width < PHONE_MAX_WIDTH || coarse
}

function read(): DisplayMode {
  const coarse = typeof window.matchMedia === 'function' ? window.matchMedia(COARSE_QUERY).matches : false
  return isPhone(window.innerWidth, coarse) ? 'phone' : 'desktop'
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange)
  const mq = typeof window.matchMedia === 'function' ? window.matchMedia(COARSE_QUERY) : null
  mq?.addEventListener('change', onChange)
  return () => {
    window.removeEventListener('resize', onChange)
    mq?.removeEventListener('change', onChange)
  }
}

export function useDisplayMode(): DisplayMode {
  return useSyncExternalStore(subscribe, read, () => 'desktop')
}
