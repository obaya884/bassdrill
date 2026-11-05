import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { note } from '../domain/pitch'
import { CircleOfFifths } from './CircleOfFifths'

describe('CircleOfFifths', () => {
  it('12 のボタンを持ち、クリックで onSelect に NoteName を渡す', async () => {
    const onSelect = vi.fn()
    render(<CircleOfFifths current={note('C')} onSelect={onSelect} />)
    expect(screen.getAllByRole('button')).toHaveLength(12)
    expect(screen.getByRole('button', { name: 'C' })).toHaveAttribute('data-current', 'true')
    expect(screen.getByRole('button', { name: 'G' })).not.toHaveAttribute('data-current', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'E♭' }))
    expect(onSelect).toHaveBeenCalledWith(note('E', -1))
  })
})
