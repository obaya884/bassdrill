// 音の入切と鳴らす入口（F-506）。開いた瞬間の入切は呼ぶ側（App）が表示モードで決める。
// AudioContext は入にする操作か、入のまま最初に鳴らす操作の中で作る（ブラウザは利用者の操作の中でしか音を使い始められない）
import { useCallback, useRef, useState } from 'react'
import { type SoundStep } from '../domain/sound'
import { type AudioContextLike, type Player, createPlayer } from './audioPlayer'

export type SoundState = { enabled: boolean; toggle(): void; play(steps: SoundStep[]): void }

/** 他のアプリの音との重なり方を決める音声セッション（AudioSession API。WebKit のみ。無い環境は null） */
export type AudioSessionLike = { type: string }

type Options = { createContext?: () => AudioContextLike | null; getAudioSession?: () => AudioSessionLike | null; initialEnabled?: boolean }

const defaultCreateContext = (): AudioContextLike | null =>
  typeof window !== 'undefined' && typeof window.AudioContext === 'function' ? new window.AudioContext() : null

const defaultAudioSession = (): AudioSessionLike | null =>
  typeof navigator !== 'undefined' ? ((navigator as { audioSession?: AudioSessionLike }).audioSession ?? null) : null

export function useSound({ createContext = defaultCreateContext, getAudioSession = defaultAudioSession, initialEnabled = false }: Options = {}): SoundState {
  const [enabled, setEnabled] = useState(initialEnabled)
  const ctxRef = useRef<AudioContextLike | null>(null)
  const playerRef = useRef<Player | null>(null)
  const created = useRef(false)

  // 音の準備。利用者の操作（入切ボタン・行タップ・答え・再生ボタン）の中から呼ぶ
  const prepare = useCallback(() => {
    // 先に鳴っている他のアプリの音（音楽など）を止めず、重ねて鳴らす（F-506）。iOS の playback は他のアプリの音を止める。
    // 引き換えにマナーモード中はスピーカーから鳴らない（両立する指定は Web に無い。log_12 2026-11-09）。
    // 設定はブラウザ全体に残るので、以前の playback が残っていても上書きするよう明示する。
    // AudioContext を作る前に設定する（作成済みの文脈には効かなかった。実機 2026-11-07）
    const session = getAudioSession()
    if (session) session.type = 'ambient'
    if (!created.current) {
      created.current = true
      ctxRef.current = createContext()
      playerRef.current = ctxRef.current ? createPlayer(ctxRef.current) : null
    }
    void ctxRef.current?.resume()
  }, [createContext, getAudioSession])

  // 副作用は setState の更新関数の外で起こす（StrictMode の二重実行で 2 回作らないため）
  const toggle = useCallback(() => {
    const next = !enabled
    if (next) {
      prepare()
    } else {
      playerRef.current?.stop()
    }
    setEnabled(next)
  }, [enabled, prepare])

  // 入で開いた（PC の既定）ときは toggle を経ないので、最初に鳴らす操作の中で作る
  const play = useCallback((steps: SoundStep[]) => {
    if (!enabled) return
    if (!created.current) prepare()
    playerRef.current?.play(steps)
  }, [enabled, prepare])

  return { enabled, toggle, play }
}
