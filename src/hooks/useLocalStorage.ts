export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T) => void
  removeValue: () => void
  error: string | null
}

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> => {
  // Placeholder implementation
  return {
    value: initialValue,
    setValue: (value: T) => {
      console.log('Setting localStorage value:', key, value)
    },
    removeValue: () => {
      console.log('Removing localStorage value:', key)
    },
    error: null,
  }
}
