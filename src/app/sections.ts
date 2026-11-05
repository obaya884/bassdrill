// 7 節の並びと見出し（F-501。文言は画面定義書 13 §6）
export const SECTIONS = ['key', 'scale', 'penta', 'seventh', 'quiz', 'diatonic', 'nonDiatonic'] as const
export type SectionId = (typeof SECTIONS)[number]

export const SECTION_TITLES: Record<SectionId, string> = {
  key: 'キー',
  scale: 'メジャースケール',
  penta: 'ペンタトニック',
  seventh: 'セブンスコード',
  quiz: '度数',
  diatonic: 'ダイアトニック',
  nonDiatonic: 'ノンダイアトニック',
}

/** 節 7 のガイド文（F-303。画面定義書 13 §6） */
export const NON_DIATONIC_GUIDE =
  'ダイアトニックでないコードは無数にあるが、J-POP・Rock でよく使われるのはこの 8 つ。スケールから外れた音をベースラインに取り入れるとよい'
