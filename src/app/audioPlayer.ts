// Web Audio で段取り（domain/sound）を鳴らす（F-306・F-406）。AudioContext は引数で受け、テストでは偽物を使う
import { type SoundStep, frequency } from '../domain/sound'

/** 使うものだけに絞った AudioContext の型 */
export type AudioContextLike = {
  currentTime: number
  destination: AudioNode
  state: string
  resume(): Promise<void>
  createOscillator(): OscillatorNode
  createGain(): GainNode
}

export type Player = { play(steps: SoundStep[]): void; stop(): void }

const ATTACK = 0.01
const RELEASE = 0.05
const PEAK = 0.3
/** 途中で止めるときに音量を落とす時間（秒）。即時に切るとプチッと鳴る */
export const FADE = 0.01

export function createPlayer(ctx: AudioContextLike): Player {
  let oscs: OscillatorNode[] = []
  let gains: GainNode[] = []

  // 鳴っている音を FADE 秒で消してから止める。停止済みのノードは参照を捨てるだけでよい
  const stop = () => {
    const now = ctx.currentTime
    for (const g of gains) {
      g.gain.cancelScheduledValues(now)
      g.gain.setValueAtTime(g.gain.value, now)
      g.gain.linearRampToValueAtTime(0, now + FADE)
    }
    for (const o of oscs) {
      try { o.stop(now + FADE) } catch { /* 停止済みは無視 */ }
    }
    oscs = []
    gains = []
  }

  const play = (steps: SoundStep[]) => {
    stop()
    // iOS は画面ロックやアプリ切替で AudioContext を中断する。利用者の操作の中なので再開できる
    if (ctx.state !== 'running') void ctx.resume()
    let at = ctx.currentTime
    for (const step of steps) {
      if (step.midis.length === 0) continue
      const end = at + step.seconds
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, at)
      gain.gain.linearRampToValueAtTime(PEAK / step.midis.length, at + ATTACK)
      gain.gain.setValueAtTime(PEAK / step.midis.length, Math.max(at + ATTACK, end - RELEASE))
      gain.gain.linearRampToValueAtTime(0, end)
      gain.connect(ctx.destination)
      gains.push(gain)
      for (const midi of step.midis) {
        const osc = ctx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.value = frequency(midi)
        osc.connect(gain)
        osc.start(at)
        osc.stop(end)
        oscs.push(osc)
      }
      at = end
    }
  }

  return { play, stop }
}
