import { within } from '@testing-library/react'

/** フォーカス中の節（コード表は 3 節が同時に描かれるので絞る） */
export const focused = () => within(document.querySelector('section[data-focused="true"]') as HTMLElement)
