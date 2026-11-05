import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { note } from '../domain/pitch'
import { KeyChooser } from './KeyChooser'

describe('KeyChooser', () => {
  it('12 キーを 5 度圏の円に並べ、今のキーに data-current、中央に今のキー名、下に「次のキー」', async () => {
    const onSelect = vi.fn(), onNext = vi.fn()
    render(<KeyChooser current={note('C')} onSelect={onSelect} onNext={onNext} />)
    expect(screen.getByRole('heading', { name: 'キーを選ぶ' })).toBeInTheDocument()
    const circle = screen.getByRole('group', { name: '5 度圏' })
    const keys = within(circle).getAllByRole('button')
    expect(keys.map((b) => b.textContent)).toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'])
    expect(within(circle).getByRole('button', { name: 'C' })).toHaveAttribute('data-current', 'true')
    expect(within(circle).getByRole('button', { name: 'G' })).not.toHaveAttribute('data-current')
    expect(within(circle).getByTestId('circle-center')).toHaveTextContent('C')
    // C は 12 時、G は 1 時の位置（左から右へ、上から下へ）
    const pos = (name: string) => within(circle).getByRole('button', { name }).style
    expect(parseFloat(pos('G').left)).toBeGreaterThan(parseFloat(pos('C').left))
    expect(parseFloat(pos('G').top)).toBeGreaterThan(parseFloat(pos('C').top))
    expect(parseFloat(pos('G♭').top)).toBeGreaterThan(parseFloat(pos('C').top) + 200)
    await userEvent.click(within(circle).getByRole('button', { name: 'E♭' }))
    expect(onSelect).toHaveBeenCalledWith(note('E', -1))
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
