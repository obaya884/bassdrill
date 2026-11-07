import { describe, it, expect } from 'vitest'
import { createPlayer } from './audioPlayer'
import { frequency } from '../domain/sound'
import { fakeAudioContext } from '../test/fakeAudio'

const steps = [{ midis: [40], seconds: 0.3 }, { midis: [40, 44], seconds: 1.0 }]

describe('createPlayer', () => {
  it('play は段ごとに音の数だけオシレーターを作り、三角波で、開始と終了を段取りどおりに予約する', () => {
    const ctx = fakeAudioContext(10)
    createPlayer(ctx).play(steps)
    expect(ctx.oscs).toHaveLength(3)
    expect(ctx.oscs.map((o) => o.type)).toEqual(['triangle', 'triangle', 'triangle'])
    expect(ctx.oscs[0].frequency.value).toBeCloseTo(frequency(40), 6)
    expect(ctx.oscs[2].frequency.value).toBeCloseTo(frequency(44), 6)
    expect(ctx.oscs[0].start).toHaveBeenCalledWith(10)
    expect(ctx.oscs[0].stop).toHaveBeenCalledWith(10.3)
    expect(ctx.oscs[1].start).toHaveBeenCalledWith(10.3)
    expect(ctx.oscs[1].stop).toHaveBeenCalledWith(11.3)
    expect(ctx.oscs[2].start).toHaveBeenCalledWith(10.3)
    // 段ごとに 1 つのゲインを通して destination へ
    expect(ctx.gains).toHaveLength(2)
    expect(ctx.gains[1].connect).toHaveBeenCalledWith(ctx.destination)
    expect(ctx.oscs[1].connect).toHaveBeenCalledWith(ctx.gains[1])
  })
  it('play を続けて呼ぶと、前のオシレーターを今の時刻で止めてから新しい段取りを予約する', () => {
    const ctx = fakeAudioContext(10)
    const player = createPlayer(ctx)
    player.play(steps)
    const first = [...ctx.oscs]
    ctx.currentTime = 10.1
    player.play(steps)
    first.forEach((o) => expect(o.stop).toHaveBeenLastCalledWith(10.1))
    expect(ctx.oscs).toHaveLength(6)
    expect(ctx.oscs[3].start).toHaveBeenCalledWith(10.1)
  })
  it('stop は予約済みの全オシレーターを止め、ゲインを切り離す', () => {
    const ctx = fakeAudioContext(10)
    const player = createPlayer(ctx)
    player.play(steps)
    ctx.currentTime = 10.2
    player.stop()
    ctx.oscs.forEach((o) => expect(o.stop).toHaveBeenLastCalledWith(10.2))
    ctx.gains.forEach((g) => expect(g.disconnect).toHaveBeenCalled())
    // 止めた後にもう一度 stop しても落ちない
    player.stop()
  })
  it('空の段取りでは何も作らない', () => {
    const ctx = fakeAudioContext(0)
    createPlayer(ctx).play([])
    expect(ctx.oscs).toHaveLength(0)
    expect(ctx.gains).toHaveLength(0)
  })
})
