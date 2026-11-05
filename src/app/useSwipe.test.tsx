import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useSwipe } from './useSwipe'

function Strip(props: Parameters<typeof useSwipe>[0]) {
  const handlers = useSwipe(props)
  return (
    <div data-testid="strip" {...handlers}>
      <div data-fretboard-scroll data-testid="box">指板</div>
      <div data-testid="card">カード</div>
    </div>
  )
}

const swipe = (el: Element, from: [number, number], to: [number, number]) => {
  fireEvent.pointerDown(el, { clientX: from[0], clientY: from[1], pointerId: 1 })
  fireEvent.pointerMove(el, { clientX: to[0], clientY: to[1], pointerId: 1 })
  fireEvent.pointerUp(el, { clientX: to[0], clientY: to[1], pointerId: 1 })
}

describe('useSwipe', () => {
  it('左へ 48px 以上でスワイプ左、右へなら右、未満はタップ', () => {
    const onSwipeLeft = vi.fn(), onSwipeRight = vi.fn(), onTap = vi.fn()
    render(<Strip onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} onTap={onTap} ignoreWithin="[data-fretboard-scroll]" />)
    const card = screen.getByTestId('card')
    swipe(card, [300, 300], [240, 305])
    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    swipe(card, [100, 300], [160, 300])
    expect(onSwipeRight).toHaveBeenCalledTimes(1)
    swipe(card, [100, 100], [110, 103])
    expect(onTap).toHaveBeenCalledTimes(1)
    expect(onTap.mock.calls[0][0]).toBe(card)
    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
  })
  it('縦移動のほうが大きければ何もしない', () => {
    const onSwipeLeft = vi.fn(), onTap = vi.fn()
    render(<Strip onSwipeLeft={onSwipeLeft} onSwipeRight={() => {}} onTap={onTap} />)
    swipe(screen.getByTestId('card'), [300, 100], [240, 200])
    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onTap).not.toHaveBeenCalled()
  })
  it('ignoreWithin の中で始まった動きは無視する', () => {
    const onSwipeLeft = vi.fn(), onTap = vi.fn()
    render(<Strip onSwipeLeft={onSwipeLeft} onSwipeRight={() => {}} onTap={onTap} ignoreWithin="[data-fretboard-scroll]" />)
    swipe(screen.getByTestId('box'), [300, 300], [100, 300])
    swipe(screen.getByTestId('box'), [300, 300], [301, 300])
    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onTap).not.toHaveBeenCalled()
  })
  it('追随中は onDrag に dx、離したら onRelease', () => {
    const onDrag = vi.fn(), onRelease = vi.fn()
    render(<Strip onSwipeLeft={() => {}} onSwipeRight={() => {}} onDrag={onDrag} onRelease={onRelease} />)
    swipe(screen.getByTestId('card'), [300, 300], [250, 300])
    expect(onDrag).toHaveBeenCalledWith(-50)
    expect(onRelease).toHaveBeenCalledTimes(1)
  })
})
