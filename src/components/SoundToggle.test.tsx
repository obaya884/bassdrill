import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SoundToggle } from './SoundToggle'

describe('SoundToggle', () => {
  it('aria-label は「音の入切」、aria-pressed が状態を表し、押すと onToggle が 1 回', async () => {
    const onToggle = vi.fn()
    const { rerender } = render(<SoundToggle enabled={false} onToggle={onToggle} />)
    const btn = screen.getByRole('button', { name: '音の入切' })
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(btn)
    expect(onToggle).toHaveBeenCalledTimes(1)
    rerender(<SoundToggle enabled onToggle={onToggle} />)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })
  it('切は斜線（data-state="off"）、入は弧（data-state="on"）で、文字は無い', () => {
    const { rerender } = render(<SoundToggle enabled={false} onToggle={() => {}} />)
    const btn = screen.getByRole('button', { name: '音の入切' })
    expect(btn).toHaveAttribute('data-state', 'off')
    expect(btn.textContent).toBe('')
    expect(btn.querySelector('[data-part="slash"]')).not.toBeNull()
    expect(btn.querySelector('[data-part="wave"]')).toBeNull()
    rerender(<SoundToggle enabled onToggle={() => {}} />)
    expect(btn).toHaveAttribute('data-state', 'on')
    expect(btn.querySelector('[data-part="slash"]')).toBeNull()
    expect(btn.querySelector('[data-part="wave"]')).not.toBeNull()
  })
})
