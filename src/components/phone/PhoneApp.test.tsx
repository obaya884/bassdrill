import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../app/App'
import { focused } from '../../test/focused'
import { setViewport } from '../../test/viewport'

const NOW = new Date('2026-11-05T09:00:00+09:00')
const next = () => userEvent.click(screen.getByRole('button', { name: '次の節' }))

describe('PhoneApp: 骨組み（F-601・F-602）', () => {
  beforeEach(() => {
    localStorage.clear()
    setViewport(390)
  })

  it('幅 390 ではスマホの木が描かれ、節 1 がフォーカス', () => {
    render(<App now={NOW} />)
    expect(screen.getByTestId('page-strip')).toBeInTheDocument()
    expect(screen.queryByText(/J\/K/)).not.toBeInTheDocument()
    expect(screen.getByText('節 1 / 7 キー')).toBeInTheDocument()
    expect(focused().getByText('今日のキー')).toBeInTheDocument()
  })
  it('› ‹ で節が移り、端で止まる', async () => {
    render(<App now={NOW} />)
    await next()
    expect(screen.getByText('節 2 / 7 メジャースケール')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '前の節' }))
    expect(screen.getByText('節 1 / 7 キー')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '前の節' })).toBeDisabled()
    for (let i = 0; i < 8; i++) await next()
    expect(screen.getByText('節 7 / 7 ノンダイアトニック')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '次の節' })).toBeDisabled()
  })
  it('下部バーは節ごとに変わる', async () => {
    render(<App now={NOW} />)
    expect(screen.getByRole('button', { name: '次のキー' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '▶' })).not.toBeInTheDocument()
    await next(); await next() // 節 3
    expect(screen.getByRole('button', { name: 'メジャー / マイナー' })).toBeInTheDocument()
    await next() // 節 4
    expect(screen.getByRole('button', { name: '▶' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '◀' })).toBeInTheDocument()
    await next() // 節 5
    expect(screen.getByRole('button', { name: '答え / 次' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '自動送り' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '▶' })).not.toBeInTheDocument()
  })
  it('次のキー で節に留まる（スマホ）', async () => {
    render(<App now={NOW} />)
    await next()
    await userEvent.click(screen.getByRole('button', { name: '次のキー' }))
    expect(screen.getByText('節 2 / 7 メジャースケール')).toBeInTheDocument()
    expect(screen.getByText('2 / 12')).toBeInTheDocument()
  })
  it('外付けキーボードの J/K は効くが、? を押してもヘルプは出ない', async () => {
    render(<App now={NOW} />)
    await userEvent.keyboard('j')
    expect(screen.getByText('節 2 / 7 メジャースケール')).toBeInTheDocument()
    await userEvent.keyboard('?')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('PhoneApp: スワイプ（F-601）', () => {
  beforeEach(() => {
    localStorage.clear()
    setViewport(390)
  })
  it('帯の上で左にスワイプすると次の節へ、右で前の節へ', () => {
    render(<App now={NOW} />)
    const strip = screen.getByTestId('page-strip')
    fireEvent.pointerDown(strip, { clientX: 300, clientY: 300, pointerId: 1 })
    fireEvent.pointerMove(strip, { clientX: 200, clientY: 305, pointerId: 1 })
    fireEvent.pointerUp(strip, { clientX: 200, clientY: 305, pointerId: 1 })
    expect(screen.getByText('節 2 / 7 メジャースケール')).toBeInTheDocument()
    fireEvent.pointerDown(strip, { clientX: 100, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(strip, { clientX: 200, clientY: 300, pointerId: 1 })
    expect(screen.getByText('節 1 / 7 キー')).toBeInTheDocument()
  })
})
