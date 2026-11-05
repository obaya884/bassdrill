import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { note } from '../../domain/pitch'
import { nonDiatonicChords } from '../../domain/progression'
import { ChordTable } from '../ChordTable'
import { FretboardScroller } from './FretboardScroller'

describe('スマホ用の部品', () => {
  it('compact のコード表は行タップで選択し、選択行だけコード度数を出す', async () => {
    const onSelect = vi.fn()
    render(<ChordTable chords={nonDiatonicChords(note('C'))} selected={1} compact onSelect={onSelect} highlightOutside />) // D7
    await userEvent.click(screen.getByText('E7'))
    expect(onSelect).toHaveBeenCalledWith(2)
    expect(screen.getAllByText('♭7')).toHaveLength(1) // 選択行（D7）だけ
    expect(screen.getByText('F♯').closest('[data-outside]')).toHaveAttribute('data-outside', 'true')
  })
  it('通常のコード表は全行にコード度数を出す', () => {
    render(<ChordTable chords={nonDiatonicChords(note('C'))} selected={1} />)
    expect(screen.getAllByText('♭7').length).toBeGreaterThan(1)
  })
  it('FretboardScroller は横スクロールの箱で、指板のスワイプ除外の印を持つ', () => {
    render(<FretboardScroller><svg data-testid="fb" /></FretboardScroller>)
    const box = screen.getByTestId('fretboard-scroll')
    expect(box).toHaveAttribute('data-fretboard-scroll')
    expect(box.style.touchAction).toBe('pan-x pan-y')
    expect(box.querySelector('[data-testid="fb"]')).not.toBeNull()
  })
})
