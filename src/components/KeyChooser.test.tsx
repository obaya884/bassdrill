import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { note } from '../domain/pitch'
import { KeyChooser } from './KeyChooser'

describe('KeyChooser', () => {
  it('12 キーと「次のキー」を持ち、今のキーに data-current', async () => {
    const onSelect = vi.fn(), onNext = vi.fn()
    render(<KeyChooser current={note('C')} onSelect={onSelect} onNext={onNext} />)
    expect(screen.getByRole('heading', { name: 'キーを選ぶ' })).toBeInTheDocument()
    const keys = screen.getAllByRole('button').filter((b) => b.textContent !== '次のキー')
    expect(keys).toHaveLength(12)
    expect(keys.map((b) => b.textContent)).toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'])
    expect(screen.getByRole('button', { name: 'C' })).toHaveAttribute('data-current', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'E♭' }))
    expect(onSelect).toHaveBeenCalledWith(note('E', -1))
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
