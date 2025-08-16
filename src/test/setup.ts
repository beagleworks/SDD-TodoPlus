import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.open for X (Twitter) integration tests
Object.defineProperty(window, 'open', {
  value: vi.fn(),
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
