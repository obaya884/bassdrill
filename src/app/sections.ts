// 6 節の並びと見出し（F-501。番号は付けない。文言は画面定義書 13 §6。ノンダイアトニックのガイド文は components/sections/chordSections）
export const SECTIONS = ['scale', 'penta', 'seventh', 'quiz', 'diatonic', 'nonDiatonic'] as const
export type SectionId = (typeof SECTIONS)[number]

export const SECTION_TITLES: Record<SectionId, string> = {
  scale: 'メジャースケール',
  penta: 'ペンタトニック',
  seventh: '7th コード（四和音）',
  quiz: '度数',
  diatonic: 'ダイアトニック',
  nonDiatonic: 'ノンダイアトニック',
}
