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
    render(<ChordTable chords={nonDiatonicChords(note('C'))} selected={1} />) // D7
    const row = screen.getByRole('row', { selected: true })
    expect(within(row).getByText('D7')).toBeInTheDocument()
    expect(within(row).getByText('F♯').closest('[data-outside]')).toHaveAttribute('data-outside', 'true')
    expect(within(row).getByText('D').closest('[data-outside]')).toBeNull()
    expect(screen.getAllByRole('row')).toHaveLength(8)
  })
  it('ChordSection は選択コードの構成音を指板に出し、外れ音は outside', () => {
    render(<ChordSection chords={nonDiatonicChords(note('C'))} selected={1} guide="ガイド文" />)
    expect(screen.getByText('ガイド文')).toBeInTheDocument()
    const ms = screen.getAllByTestId('marker')
    expect(ms.filter((m) => m.dataset.kind === 'outside').every((m) => m.textContent?.startsWith('F♯'))).toBe(true)
    expect(ms.filter((m) => m.dataset.kind === 'root').every((m) => m.textContent?.startsWith('D'))).toBe(true)
  })
})
