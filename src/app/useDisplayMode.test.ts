import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { setViewport } from '../test/viewport'
import { isPhone, useDisplayMode } from './useDisplayMode'

describe('useDisplayMode', () => {
  it('isPhone は幅 1024 未満か coarse で真', () => {
    expect(isPhone(1023, false)).toBe(true)
    expect(isPhone(1024, false)).toBe(false)
    expect(isPhone(1280, true)).toBe(true)
  })
  it('useDisplayMode は resize と pointer の変化に追随する', () => {
    setViewport(1280)
    const { result } = renderHook(() => useDisplayMode())
    expect(result.current).toBe('desktop')
    act(() => setViewport(390))
    expect(result.current).toBe('phone')
    act(() => setViewport(1280, true))
    expect(result.current).toBe('phone')
    act(() => setViewport(1280, false))
    expect(result.current).toBe('desktop')
  })
})
