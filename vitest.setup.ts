import '@testing-library/jest-dom'
import { vi } from 'vitest'
import * as nextNavigation from 'next/navigation'

// Mock next/navigation for all tests
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof nextNavigation>('next/navigation')
  return {
    ...actual,
    useRouter: vi.fn().mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    usePathname: vi.fn().mockReturnValue('/'),
    useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
  }
})
