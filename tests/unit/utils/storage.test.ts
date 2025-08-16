import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  setToStorage,
  getFromStorage,
  removeFromStorage,
} from '../../../src/utils/storage'
import type { Todo } from '../../../src/types/todo'

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

describe('storage utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('setToStorage', () => {
    it('should save data to localStorage', () => {
      const testData: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          status: 'not_started',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 1,
        },
      ]

      setToStorage('test-key', testData)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData)
      )
    })

    it('should handle storage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full')
      })

      expect(() => setToStorage('test-key', {})).toThrow()
    })
  })

  describe('getFromStorage', () => {
    it('should load data from localStorage', () => {
      const testData = [{ id: '1', title: 'Test' }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData))

      const result = getFromStorage('test-key')

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
      expect(result).toEqual(testData)
    })

    it('should return null for non-existent keys', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = getFromStorage('non-existent-key')

      expect(result).toBeNull()
    })

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const result = getFromStorage('test-key')

      expect(result).toBeNull()
    })
  })

  describe('removeFromStorage', () => {
    it('should remove data from localStorage', () => {
      removeFromStorage('test-key')

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should handle removal errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => removeFromStorage('test-key')).not.toThrow()
    })
  })
})
