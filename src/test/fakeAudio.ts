// テスト用: Web Audio の偽物。jsdom に AudioContext は無いので、呼び出しを記録するだけの最小の形
import { vi } from 'vitest'
import { type AudioContextLike } from '../app/audioPlayer'

export type FakeParam = { value: number; setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn>; cancelScheduledValues: ReturnType<typeof vi.fn> }
export type FakeOsc = { type: string; frequency: FakeParam; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }
export type FakeGain = { gain: FakeParam; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }
export type FakeContext = AudioContextLike & { oscs: FakeOsc[]; gains: FakeGain[]; resume: ReturnType<typeof vi.fn> }

const param = (): FakeParam => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() })

export function fakeAudioContext(currentTime = 0): FakeContext {
  const oscs: FakeOsc[] = []
  const gains: FakeGain[] = []
  const ctx: { state: string; [k: string]: unknown } = {
    currentTime,
    state: 'suspended',
    destination: {} as AudioNode,
    resume: vi.fn(async () => { ctx.state = 'running' }),
    createOscillator: () => {
      const o: FakeOsc = { type: 'sine', frequency: param(), connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn() }
      oscs.push(o)
      return o as unknown as OscillatorNode
    },
    createGain: () => {
      const g: FakeGain = { gain: param(), connect: vi.fn(), disconnect: vi.fn() }
      gains.push(g)
      return g as unknown as GainNode
    },
    oscs,
    gains,
  }
  return ctx as unknown as FakeContext
}
