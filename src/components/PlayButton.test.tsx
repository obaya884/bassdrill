import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayButton } from './PlayButton'

describe('PlayButton', () => {
  it('aria-label は渡した名前、文字は無く ▶ の印だけ。押すと onPlay が 1 回', async () => {
    const onPlay = vi.fn()
    render(<PlayButton label="スケールを再生" enabled onPlay={onPlay} />)
    const btn = screen.getByRole('button', { name: 'スケールを再生' })
    expect(btn.textContent).toBe('')
    expect(btn.querySelector('svg')).not.toBeNull()
    await userEvent.click(btn)
    expect(onPlay).toHaveBeenCalledTimes(1)
  })
  it('音が切のときは disabled で押せず、押しても onPlay は呼ばれない', async () => {
    const onPlay = vi.fn()
    render(<PlayButton label="ペンタを再生" enabled={false} onPlay={onPlay} />)
    const btn = screen.getByRole('button', { name: 'ペンタを再生' })
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onPlay).not.toHaveBeenCalled()
  })
})
