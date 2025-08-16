import type { AppError } from '../types/errors'

export function createAppError(
  error: Error,
  type: AppError['type'] = 'UNKNOWN_ERROR'
): AppError {
  return {
    type,
    message: error.message,
    details: error,
  }
}

export function handleGlobalError(error: Error): void {
  console.error('Global error:', error)

  // In a real app, you might want to send this to a logging service
  // or show a user-friendly notification
}

export function isStorageError(error: Error): boolean {
  return (
    error.message.includes('localStorage') ||
    error.message.includes('storage') ||
    error.name === 'QuotaExceededError'
  )
}

export function createStorageError(
  message: string,
  details?: unknown
): AppError {
  return {
    type: 'STORAGE_ERROR',
    message,
    details,
  }
}

export function createValidationError(
  message: string,
  details?: unknown
): AppError {
  return {
    type: 'VALIDATION_ERROR',
    message,
    details,
  }
}

export function createNetworkError(
  message: string,
  details?: unknown
): AppError {
  return {
    type: 'NETWORK_ERROR',
    message,
    details,
  }
}

export function isRecoverableError(error: AppError): boolean {
  // Storage and network errors are typically recoverable
  return error.type === 'STORAGE_ERROR' || error.type === 'NETWORK_ERROR'
}

export function getErrorDisplayMessage(error: AppError): string {
  switch (error.type) {
    case 'STORAGE_ERROR':
      return 'There was a problem saving your data. Please try again.'
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again.'
    case 'NETWORK_ERROR':
      return 'Network connection failed. Please check your connection and try again.'
    case 'UNKNOWN_ERROR':
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}
