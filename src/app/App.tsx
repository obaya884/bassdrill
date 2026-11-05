// 表示モード（F-601）を見て、PC とスマホのどちらか一方の木を描く（F-606）。状態は両方で共有する
import { useDisplayMode } from './useDisplayMode'
import { useDrillState } from './useDrillState'
import { DesktopApp } from './DesktopApp'
import { PhoneApp } from './PhoneApp'

export function App({ now }: { now?: Date }) {
  const mode = useDisplayMode()
  const state = useDrillState({ now, mode })
  return mode === 'phone' ? <PhoneApp state={state} /> : <DesktopApp state={state} />
}
