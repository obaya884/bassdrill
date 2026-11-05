import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { installMatchMediaPolyfill, setViewport } from './viewport'

// globals: false なので RTL の自動 cleanup が効かない。毎テスト後に明示する
afterEach(() => cleanup())

// jsdom には scrollIntoView が無い
Element.prototype.scrollIntoView ??= () => {}

// 表示モードの判定（F-601）のため。既定は PC（幅 1280・タッチ主体でない）
installMatchMediaPolyfill()
beforeEach(() => setViewport(1280, false))
