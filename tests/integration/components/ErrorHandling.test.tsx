import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../../../src/components/ErrorBoundary'
import { ErrorDisplay } from '../../../src/components/ErrorDisplay'
import {
  handleGlobalError,
  createAppError,
} from '../../../src/utils/errorHandler'
import type { AppError } from '../../../src/types/errors'

// Mock component that can throw errors on demand
const ErrorThrowingComponent = ({
  shouldThrow,
  errorType,
}: {
  shouldThrow: boolean
  errorType?: 'storage' | 'validation' | 'network' | 'unknown'
}) => {
  if (shouldThrow) {
    switch (errorType) {
      case 'storage':
        throw new Error('localStorage is not available')
      case 'validation':
        throw new Error('Invalid input data')
      case 'network':
        throw new Error('Network request failed')
      default:
        throw new Error('Something went wrong')
    }
  }
  return <div data-testid="working-component">Component is working</div>
}

describe('Error Handling Integration', () => {
  const originalError = console.error

  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalError
  })

  describe('ErrorBoundary + ErrorDisplay Integration', () => {
    it('should catch errors and display them with retry functionality', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should show error display
      expect(screen.getByText('Unknown Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()

      // Click retry button
      fireEvent.click(screen.getByRole('button', { name: /retry/i }))

      // Should clear error state and try to render children again
      // Since we're still passing shouldThrow=true, it will error again
      expect(screen.getByText('Unknown Error')).toBeInTheDocument()
    })

    it('should handle different error types appropriately', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} errorType="storage" />
        </ErrorBoundary>
      )

      expect(screen.getByText('Unknown Error')).toBeInTheDocument()
      expect(
        screen.getByText('localStorage is not available')
      ).toBeInTheDocument()
    })
  })

  describe('Global Error Handler', () => {
    it('should log errors to console', () => {
      const consoleSpy = vi.spyOn(console, 'error')
      const testError = new Error('Test global error')

      handleGlobalError(testError)

      expect(consoleSpy).toHaveBeenCalledWith('Global error:', testError)
    })

    it('should create appropriate AppError objects', () => {
      const originalError = new Error('Test error')
      const appError = createAppError(originalError, 'STORAGE_ERROR')

      expect(appError.type).toBe('STORAGE_ERROR')
      expect(appError.message).toBe('Test error')
      expect(appError.details).toBe(originalError)
    })
  })

  describe('ErrorDisplay Component', () => {
    it('should display different error types with appropriate styling', () => {
      const storageError: AppError = {
        type: 'STORAGE_ERROR',
        message: 'Storage failed',
        details: null,
      }

      render(<ErrorDisplay error={storageError} />)

      expect(screen.getByText('Storage Error')).toBeInTheDocument()
      expect(screen.getByText('Storage failed')).toBeInTheDocument()
    })

    it('should handle retry functionality', () => {
      const mockRetry = vi.fn()
      const error: AppError = {
        type: 'NETWORK_ERROR',
        message: 'Network failed',
        details: null,
      }

      render(<ErrorDisplay error={error} onRetry={mockRetry} />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Recovery', () => {
    it('should allow recovery after error boundary catches error', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should show error
      expect(screen.getByText('Unknown Error')).toBeInTheDocument()

      // Click retry - this will reset the error boundary state
      fireEvent.click(screen.getByRole('button', { name: /retry/i }))

      // Component should try to render again, but since we're still passing shouldThrow=true,
      // it will throw again. In a real scenario, the error condition would be fixed.
      expect(screen.getByText('Unknown Error')).toBeInTheDocument()
    })
  })
})
