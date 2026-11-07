// 音の入切と鳴らす入口（F-506）。既定は切。入にする操作の中で AudioContext を作る（iOS は利用者の操作の中でしか音を使い始められない）
import { useCallback, useRef, useState } from 'react'
import { type SoundStep } from '../domain/sound'
import { type AudioContextLike, type Player, createPlayer } from './audioPlayer'

export type SoundState = { enabled: boolean; toggle(): void; play(steps: SoundStep[]): void }

/** iOS のマナーモード中でも鳴らすための音声セッション（AudioSession API。WebKit のみ。無い環境は null） */
export type AudioSessionLike = { type: string }

type Options = { createContext?: () => AudioContextLike | null; getAudioSession?: () => AudioSessionLike | null }

const defaultCreateContext = (): AudioContextLike | null =>
  typeof window !== 'undefined' && typeof window.AudioContext === 'function' ? new window.AudioContext() : null

const defaultAudioSession = (): AudioSessionLike | null =>
  typeof navigator !== 'undefined' ? ((navigator as { audioSession?: AudioSessionLike }).audioSession ?? null) : null

export function useSound({ createContext = defaultCreateContext, getAudioSession = defaultAudioSession }: Options = {}): SoundState {
  const [enabled, setEnabled] = useState(false)
  const ctxRef = useRef<AudioContextLike | null>(null)
  const playerRef = useRef<Player | null>(null)
  const created = useRef(false)

  // 副作用は setState の更新関数の外で起こす（StrictMode の二重実行で 2 回作らないため）
  const toggle = useCallback(() => {
    const next = !enabled
    const session = getAudioSession()
    if (next) {
      // iOS はマナーモード中 Web Audio を無音にする（環境音扱い）。入にした以上は鳴らすので再生用のセッションにする（F-506）。
      // AudioContext を作る前に設定する（作成済みの文脈には効かなかった。実機 2026-11-07）
      if (session) session.type = 'playback'
      if (!created.current) {
        created.current = true
        ctxRef.current = createContext()
        playerRef.current = ctxRef.current ? createPlayer(ctxRef.current) : null
      }
      void ctxRef.current?.resume()
    } else {
      playerRef.current?.stop()
      if (session) session.type = 'auto'
    }
    setEnabled(next)
  }, [enabled, createContext, getAudioSession])

  const play = useCallback((steps: SoundStep[]) => {
    if (!enabled) return
    playerRef.current?.play(steps)
  }, [enabled])

  return { enabled, toggle, play }
}
