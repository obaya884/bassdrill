// テスト用: ビューポートの幅と「タッチ主体（pointer: coarse）」を切り替える
// jsdom には matchMedia が無いので setup.ts のポリフィルと組で使う
let coarse = false
const listeners = new Set<(e: { matches: boolean }) => void>()

export function installMatchMediaPolyfill(): void {
  if (typeof window.matchMedia === 'function' && (window.matchMedia as { __polyfill?: boolean }).__polyfill) return
  const mm = (query: string) => ({
    media: query,
    get matches() { return query.includes('pointer: coarse') ? coarse : false },
    onchange: null,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => { listeners.add(cb) },
    removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => { listeners.delete(cb) },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
  ;(mm as { __polyfill?: boolean }).__polyfill = true
  window.matchMedia = mm as unknown as typeof window.matchMedia
}

export function setViewport(width: number, isCoarse = false): void {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true })
  const coarseChanged = coarse !== isCoarse
  coarse = isCoarse
  window.dispatchEvent(new Event('resize'))
  if (coarseChanged) for (const cb of listeners) cb({ matches: coarse })
}
