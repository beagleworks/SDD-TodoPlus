export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T) => void
  removeValue: () => void
  error: string | null
}

import { useState, useCallback } from 'react'

/**
 * Custom hook for managing localStorage with type safety and error handling
 * @param key - The localStorage key
 * @param initialValue - The initial value to use if no stored value exists
 * @returns Object containing the current value, setter, remover, and error state
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> => {
  // Initialize state with value from localStorage or initialValue
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const [error, setError] = useState<string | null>(null)

  // Memoized setter function
  const setStoredValue = useCallback(
    (newValue: T) => {
      try {
        setValue(newValue)
        if (typeof window !== 'undefined') {
          // Use direct localStorage access for better error handling in tests
          window.localStorage.setItem(key, JSON.stringify(newValue))
        }
        setError(null)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
      }
    },
    [key]
  )

  // Memoized remove function
  const removeValue = useCallback(() => {
    try {
      setValue(initialValue)
      if (typeof window !== 'undefined') {
        // Use direct localStorage access for better error handling in tests
        window.localStorage.removeItem(key)
      }
      setError(null)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
    }
  }, [key, initialValue])

  return {
    value,
    setValue: setStoredValue,
    removeValue,
    error,
  }
}
