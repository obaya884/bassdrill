import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// globals: false なので RTL の自動 cleanup が効かない。毎テスト後に明示する
afterEach(() => cleanup())
