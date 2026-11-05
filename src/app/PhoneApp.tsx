// スマホ表示（F-601〜F-606。画面定義書 13 §8）。Task 3 で中身を作る
import { useKeyboard } from './useKeyboard'
import { type DrillState } from './useDrillState'

export function PhoneApp({ state }: { state: DrillState }) {
  useKeyboard(state.onAction)
  return <div data-testid="page-strip" />
}
