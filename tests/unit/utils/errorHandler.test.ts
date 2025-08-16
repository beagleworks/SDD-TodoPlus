import { describe, it, expect, vi } from 'vitest'
import {
  handleGlobalError,
  createAppError,
  isRecoverableError,
  getErrorDisplayMessage,
  createStorageError,
  createValidationError,
  createNetworkError,
} from '../../../src/utils/errorHandler'

describe('Global Error Handler', () => {
  it('should not exist yet', () => {
    // This test should fail because handleGlobalError doesn't exist
    expect(typeof handleGlobalError).toBe('function')
  })

  it('should create AppError from generic Error', () => {
    // This test should fail because createAppError doesn't exist
    const error = new Error('Test error')
    const appError = createAppError(error)

    expect(appError.type).toBe('UNKNOWN_ERROR')
    expect(appError.message).toBe('Test error')
    expect(appError.details).toBe(error)
  })

  it('should handle storage errors specifically', () => {
    const storageError = new Error('localStorage is not available')
    const appError = createAppError(storageError, 'STORAGE_ERROR')

    expect(appError.type).toBe('STORAGE_ERROR')
    expect(appError.message).toBe('localStorage is not available')
  })

  it('should log errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Test error')

    handleGlobalError(error)

    expect(consoleSpy).toHaveBeenCalledWith('Global error:', error)
    consoleSpy.mockRestore()
  })

  it('should identify recoverable errors correctly', () => {
    const storageError = createStorageError('Storage failed')
    const networkError = createNetworkError('Network failed')
    const validationError = createValidationError('Validation failed')

    expect(isRecoverableError(storageError)).toBe(true)
    expect(isRecoverableError(networkError)).toBe(true)
    expect(isRecoverableError(validationError)).toBe(false)
  })

  it('should provide user-friendly error messages', () => {
    const storageError = createStorageError('Storage failed')
    const networkError = createNetworkError('Network failed')
    const validationError = createValidationError('Validation failed')

    expect(getErrorDisplayMessage(storageError)).toBe(
      'There was a problem saving your data. Please try again.'
    )
    expect(getErrorDisplayMessage(networkError)).toBe(
      'Network connection failed. Please check your connection and try again.'
    )
    expect(getErrorDisplayMessage(validationError)).toBe(
      'Please check your input and try again.'
    )
  })

  it('should create specific error types with correct properties', () => {
    const storageError = createStorageError('Storage failed', { key: 'todos' })
    const networkError = createNetworkError('Network failed', { status: 500 })
    const validationError = createValidationError('Validation failed', {
      field: 'title',
    })

    expect(storageError.type).toBe('STORAGE_ERROR')
    expect(storageError.details).toEqual({ key: 'todos' })

    expect(networkError.type).toBe('NETWORK_ERROR')
    expect(networkError.details).toEqual({ status: 500 })

    expect(validationError.type).toBe('VALIDATION_ERROR')
    expect(validationError.details).toEqual({ field: 'title' })
  })
})
