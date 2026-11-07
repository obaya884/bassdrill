// 音の高さと鳴らす段取り（F-306・F-406）。鳴らす処理（Web Audio）は app/audioPlayer が持ち、ここは純粋関数だけ
import { type NoteName, pitchClass } from './pitch'
import { type Chord } from './chord'
import { type IntervalId, INTERVAL_SPEC } from './quiz'

/** 同時に鳴らす MIDI ノート番号の列と、その長さ（秒） */
export type SoundStep = Readonly<{ midis: number[]; seconds: number }>

export const CHORD_NOTE_SECONDS = 0.3
export const CHORD_BLOCK_SECONDS = 1.0
export const QUIZ_BASE_SECONDS = 0.5
export const QUIZ_ANSWER_SECONDS = 0.7

/** 根音の下限。E2（開放 E 弦の 1 オクターブ上）。根音はここから E♭3 までに収める */
const ROOT_LOW = 40

/** A4（MIDI 69）= 440 Hz の平均律 */
export function frequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

/** 根音の MIDI 番号。E2（40）〜 E♭3（51）。綴りに関係なく同じ高さなら同じ番号 */
export function rootMidi(root: NoteName): number {
  return ROOT_LOW + ((pitchClass(root) - pitchClass({ letter: 'E', accidental: 0 }) + 12) % 12)
}

/** 根音から上へ 1 オクターブ内に積んだ構成音の MIDI 番号（低い順） */
function stackedMidis(chord: Chord): number[] {
  const root = rootMidi(chord.root)
  const rootPc = pitchClass(chord.root)
  return chord.tones.map((t) => root + ((pitchClass(t.note) - rootPc + 12) % 12))
}

/** コードの段取り: 低い順に 1 音ずつ → 4 音同時 */
export function chordSound(chord: Chord): SoundStep[] {
  const midis = stackedMidis(chord)
  return [
    ...midis.map((m) => ({ midis: [m], seconds: CHORD_NOTE_SECONDS })),
    { midis, seconds: CHORD_BLOCK_SECONDS },
  ]
}

/** 度数の段取り: 基準 → 答え（基準より半音数ぶん上） */
export function quizSound(base: NoteName, interval: IntervalId): SoundStep[] {
  const b = rootMidi(base)
  return [
    { midis: [b], seconds: QUIZ_BASE_SECONDS },
    { midis: [b + INTERVAL_SPEC[interval].semitones], seconds: QUIZ_ANSWER_SECONDS },
  ]
}
