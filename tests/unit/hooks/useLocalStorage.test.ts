import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useLocalStorage } from '../../../src/hooks/useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('Data reading functionality', () => {
    it('should return initial value when localStorage key does not exist', () => {
      const initialValue = { todos: [], version: '1.0.0' }
      const { result } = renderHook(() =>
        useLocalStorage('non-existent-key', initialValue)
      )

      expect(result.current.value).toEqual(initialValue)
      expect(result.current.error).toBeNull()
    })

    it('should return initial value when localStorage returns null', () => {
      const initialValue = 'default-value'
      const { result } = renderHook(() =>
        useLocalStorage('empty-key', initialValue)
      )

      expect(result.current.value).toBe(initialValue)
      expect(result.current.error).toBeNull()
    })

    it('should handle complex object initial values', () => {
      const initialValue = {
        todos: [
          {
            id: '1',
            title: 'Test Todo',
            status: 'not_started' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0,
          },
        ],
        version: '1.0.0',
      }

      const { result } = renderHook(() =>
        useLocalStorage('complex-key', initialValue)
      )

      expect(result.current.value).toEqual(initialValue)
      expect(result.current.error).toBeNull()
    })

    it('should actually read from localStorage when data exists', () => {
      // Pre-populate localStorage with data
      const existingData = {
        todos: [{ id: '1', title: 'Existing Todo' }],
        version: '1.0.0',
      }
      localStorageMock.setItem('existing-key', JSON.stringify(existingData))

      const initialValue = { todos: [], version: '1.0.0' }
      const { result } = renderHook(() =>
        useLocalStorage('existing-key', initialValue)
      )

      expect(result.current.value).toEqual(existingData)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Error handling functionality', () => {
    it('should handle localStorage setItem errors', () => {
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded')
      })

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      )

      act(() => {
        result.current.setValue('new value')
      })

      expect(result.current.error).toBe('Storage quota exceeded')
      expect(result.current.value).toBe('new value') // Value should still be updated in state

      // Restore original function
      localStorageMock.setItem = originalSetItem
    })

    it('should handle localStorage removeItem errors', () => {
      const originalRemoveItem = localStorageMock.removeItem
      localStorageMock.removeItem = vi.fn(() => {
        throw new Error('Storage access denied')
      })

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      )

      act(() => {
        result.current.removeValue()
      })

      expect(result.current.error).toBe('Storage access denied')
      expect(result.current.value).toBe('initial') // Should revert to initial value

      // Restore original function
      localStorageMock.removeItem = originalRemoveItem
    })

    it('should handle non-Error exceptions', () => {
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        throw 'String error'
      })

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      )

      act(() => {
        result.current.setValue('new value')
      })

      expect(result.current.error).toBe('Unknown error')

      // Restore original function
      localStorageMock.setItem = originalSetItem
    })
  })

  describe('Data manipulation functionality', () => {
    it('should remove data from localStorage and reset to initial value', () => {
      // Pre-populate localStorage
      const testData = {
        todos: [{ id: '1', title: 'Test Todo' }],
        version: '1.0.0',
      }
      localStorageMock.setItem('delete-test-key', JSON.stringify(testData))

      const initialValue = { todos: [], version: '1.0.0' }
      const { result } = renderHook(() =>
        useLocalStorage('delete-test-key', initialValue)
      )

      // Verify data is loaded
      expect(result.current.value).toEqual(testData)

      // Remove the data
      act(() => {
        result.current.removeValue()
      })

      // Should reset to initial value
      expect(result.current.value).toEqual(initialValue)
      expect(result.current.error).toBeNull()

      // Should be removed from localStorage
      expect(localStorageMock.getItem('delete-test-key')).toBeNull()
    })

    it('should handle setValue and persist data correctly', () => {
      const initialValue = 'initial'
      const { result } = renderHook(() =>
        useLocalStorage('set-test-key', initialValue)
      )

      const newValue = 'updated value'
      act(() => {
        result.current.setValue(newValue)
      })

      expect(result.current.value).toBe(newValue)
      expect(result.current.error).toBeNull()
      expect(localStorageMock.getItem('set-test-key')).toBe(
        JSON.stringify(newValue)
      )
    })

    it('should handle complex object setValue operations', () => {
      const initialValue = { todos: [], version: '1.0.0' }
      const { result } = renderHook(() =>
        useLocalStorage('complex-set-key', initialValue)
      )

      const newValue = {
        todos: [
          { id: '1', title: 'New Todo', status: 'not_started' as const },
          { id: '2', title: 'Another Todo', status: 'in_progress' as const },
        ],
        version: '1.1.0',
      }

      act(() => {
        result.current.setValue(newValue)
      })

      expect(result.current.value).toEqual(newValue)
      expect(result.current.error).toBeNull()
      expect(JSON.parse(localStorageMock.getItem('complex-set-key')!)).toEqual(
        newValue
      )
    })
  })

  describe('Edge cases and error scenarios', () => {
    it('should handle corrupted JSON data in localStorage', () => {
      // Set invalid JSON in localStorage
      localStorageMock.setItem('corrupted-key', 'invalid-json{')

      const initialValue = { todos: [], version: '1.0.0' }
      const { result } = renderHook(() =>
        useLocalStorage('corrupted-key', initialValue)
      )

      // Should fallback to initial value when JSON parsing fails
      expect(result.current.value).toEqual(initialValue)
      expect(result.current.error).toBeNull()
    })

    it('should handle localStorage unavailable scenario', () => {
      // Mock localStorage to throw on getItem
      const originalGetItem = Object.getOwnPropertyDescriptor(
        window,
        'localStorage'
      )
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => {
            throw new Error('localStorage not available')
          },
          setItem: localStorageMock.setItem,
          removeItem: localStorageMock.removeItem,
        },
        configurable: true,
      })

      const initialValue = 'fallback'
      const { result } = renderHook(() =>
        useLocalStorage('unavailable-key', initialValue)
      )

      expect(result.current.value).toBe(initialValue)

      // Restore original localStorage
      if (originalGetItem) {
        Object.defineProperty(window, 'localStorage', originalGetItem)
      }
    })

    it('should clear error state when successful operation follows failed one', () => {
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('First error')
      })

      const { result } = renderHook(() =>
        useLocalStorage('error-clear-key', 'initial')
      )

      // First operation should fail
      act(() => {
        result.current.setValue('fail')
      })
      expect(result.current.error).toBe('First error')

      // Restore working setItem
      localStorageMock.setItem = originalSetItem

      // Second operation should succeed and clear error
      act(() => {
        result.current.setValue('success')
      })
      expect(result.current.error).toBeNull()
      expect(result.current.value).toBe('success')
    })
  })
})
