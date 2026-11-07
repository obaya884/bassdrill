// 表示モード（F-601）を見て、PC とスマホのどちらか一方の木を描く（F-606）。状態は両方で共有する。
// 音の既定（F-506）は開いた瞬間の表示モードで決める: PC は入、スマホは切。その後モードが変わっても state は引き継ぐだけ
import { useDisplayMode } from './useDisplayMode'
import { useDrillState } from './useDrillState'
import { DesktopApp } from './DesktopApp'
import { PhoneApp } from './PhoneApp'

export function App({ now }: { now?: Date }) {
  const mode = useDisplayMode()
  const state = useDrillState({ now, initialSoundEnabled: mode === 'desktop' })
  return mode === 'phone' ? <PhoneApp state={state} /> : <DesktopApp state={state} />
}
