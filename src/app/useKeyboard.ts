// keydown をアプリの操作に変換する（F-502）。対象キーは preventDefault する
import { useEffect } from 'react'

export type Action =
  | 'nextSection' | 'prevSection' | 'next' | 'prev' | 'advance'
  | 'togglePenta' | 'toggleAuto' | 'intervalUp' | 'intervalDown' | 'nextKey' | 'help' | 'escape'

const KEY_TO_ACTION: Record<string, Action> = {
  j: 'nextSection', ArrowDown: 'nextSection',
  k: 'prevSection', ArrowUp: 'prevSection',
  l: 'next', ArrowRight: 'next',
  h: 'prev', ArrowLeft: 'prev',
  ' ': 'advance', Enter: 'advance',
  m: 'togglePenta',
  a: 'toggleAuto',
  '+': 'intervalUp', '=': 'intervalUp',
  '-': 'intervalDown',
  n: 'nextKey',
  '?': 'help',
  Escape: 'escape',
}

export function actionForKey(e: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey'>): Action | undefined {
  if (e.metaKey || e.ctrlKey || e.altKey) return undefined
  return KEY_TO_ACTION[e.key] ?? KEY_TO_ACTION[e.key.toLowerCase()]
}

export function useKeyboard(onAction: (a: Action) => void): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = actionForKey(e)
      if (!action) return
      e.preventDefault()
      onAction(action)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onAction])
}
