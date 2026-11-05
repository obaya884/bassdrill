import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { note } from '../../domain/pitch'
import { nonDiatonicChords } from '../../domain/progression'
import { ChordTable } from '../ChordTable'
import { ScaleSection } from './ScaleSection'
import { PentaSection } from './PentaSection'
import { ChordSection } from './ChordSection'

describe('sections', () => {
  it('ScaleSection は C の 7 音を根音付きで出す', () => {
    render(<ScaleSection keyNote={note('C')} />)
    const ms = screen.getAllByTestId('marker')
    expect(ms.filter((m) => m.dataset.kind === 'root').length).toBeGreaterThan(0)
    expect(ms.filter((m) => m.dataset.kind === 'root').every((m) => m.textContent?.startsWith('C'))).toBe(true)
    expect(ms.length).toBe(32) // 各弦 8 音 × 4 弦
  })
  it('PentaSection major は C メジャーペンタと名乗る', () => {
    render(<PentaSection keyNote={note('C')} mode="major" />)
    expect(screen.getByRole('heading', { name: 'C メジャーペンタ' })).toBeInTheDocument()
  })
  it('PentaSection minor は A マイナーペンタと名乗り、根音が A', () => {
    render(<PentaSection keyNote={note('C')} mode="minor" />)
    expect(screen.getByRole('heading', { name: 'A マイナーペンタ' })).toBeInTheDocument()
    const roots = screen.getAllByTestId('marker').filter((m) => m.dataset.kind === 'root')
    expect(roots.length).toBeGreaterThan(0)
    expect(roots.every((m) => m.textContent?.startsWith('A'))).toBe(true)
  })
  it('ChordTable は選択行に aria-selected、外れ音のセルに data-outside を付ける', () => {
    render(<ChordTable chords={nonDiatonicChords(note('C'))} selected={1} highlightOutside />) // D7
    const row = screen.getByRole('row', { selected: true })
    expect(within(row).getByText('D7')).toBeInTheDocument()
    expect(within(row).getByText('F♯').closest('[data-outside]')).toHaveAttribute('data-outside', 'true')
    expect(within(row).getByText('D').closest('[data-outside]')).toBeNull()
    expect(screen.getAllByRole('row')).toHaveLength(8)
  })
  it('ChordSection は選択コードの構成音を指板に出し、外れ音は outside', () => {
    render(<ChordSection chords={nonDiatonicChords(note('C'))} selected={1} guide="ガイド文" highlightOutside />)
    expect(screen.getByText('ガイド文')).toBeInTheDocument()
    const ms = screen.getAllByTestId('marker')
    expect(ms.filter((m) => m.dataset.kind === 'outside').every((m) => m.textContent?.startsWith('F♯'))).toBe(true)
    expect(ms.filter((m) => m.dataset.kind === 'root').every((m) => m.textContent?.startsWith('D'))).toBe(true)
  })
})

describe('外れ音の強調は節 7 だけ（F-303）', () => {
  it('SeventhSection はスケール外の構成音を outside にしない', async () => {
    const { SeventhSection } = await import('./chordSections')
    render(<SeventhSection keyNote={note('C')} selected={1} />) // Cm7: E♭ B♭ はスケール外だが強調しない
    expect(document.querySelector('[data-outside]')).toBeNull()
    expect(screen.getAllByTestId('marker').filter((m) => m.dataset.kind === 'outside')).toHaveLength(0)
  })
  it('NonDiatonicSection は outside を付ける', async () => {
    const { NonDiatonicSection } = await import('./chordSections')
    render(<NonDiatonicSection keyNote={note('C')} selected={1} />)
    expect(document.querySelector('[data-outside="true"]')).not.toBeNull()
    expect(screen.getAllByTestId('marker').filter((m) => m.dataset.kind === 'outside').length).toBeGreaterThan(0)
  })
})

describe('根音がスケール外のコード（F-303）', () => {
  it('♭VIM7 の根音は指板で outside かつ根音の印を持つ', async () => {
    const { NonDiatonicSection } = await import('./chordSections')
    render(<NonDiatonicSection keyNote={note('C')} selected={6} />) // A♭M7
    const roots = screen.getAllByTestId('marker').filter((m) => m.textContent?.startsWith('A♭'))
    expect(roots.length).toBeGreaterThan(0)
    expect(roots.every((m) => m.dataset.kind === 'outside' && m.dataset.root === 'true')).toBe(true)
    const es = screen.getAllByTestId('marker').filter((m) => m.textContent?.startsWith('E♭'))
    expect(es.every((m) => m.dataset.kind === 'outside' && m.dataset.root === undefined)).toBe(true)
  })
})
