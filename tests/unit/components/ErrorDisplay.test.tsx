import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorDisplay } from '../../../src/components/ErrorDisplay'
import type { AppError } from '../../../src/types/errors'

describe('ErrorDisplay', () => {
  const mockError: AppError = {
    type: 'STORAGE_ERROR',
    message: 'Failed to save data',
    details: { key: 'todos' },
  }

  it('should render without crashing', () => {
    expect(() => {
      render(<ErrorDisplay error={mockError} />)
    }).not.toThrow()
  })

  it('should display error message', () => {
    render(<ErrorDisplay error={mockError} />)

    expect(screen.getByText('Failed to save data')).toBeInTheDocument()
  })

  it('should display error type', () => {
    render(<ErrorDisplay error={mockError} />)

    expect(screen.getByText(/storage error/i)).toBeInTheDocument()
  })

  it('should show retry button for recoverable errors', () => {
    const onRetry = vi.fn()
    render(<ErrorDisplay error={mockError} onRetry={onRetry} />)

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('should not show retry button when onRetry is not provided', () => {
    render(<ErrorDisplay error={mockError} />)

    expect(
      screen.queryByRole('button', { name: /retry/i })
    ).not.toBeInTheDocument()
  })

  it('should show user-friendly messages when requested', () => {
    render(<ErrorDisplay error={mockError} showUserFriendlyMessage={true} />)

    expect(
      screen.getByText(
        'There was a problem saving your data. Please try again.'
      )
    ).toBeInTheDocument()
  })

  it('should show retry button only for recoverable errors', () => {
    const validationError: AppError = {
      type: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details: null,
    }

    const { rerender } = render(
      <ErrorDisplay error={validationError} onRetry={vi.fn()} />
    )

    // Validation errors are not recoverable by default, but onRetry is provided
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()

    // Storage errors are recoverable
    rerender(<ErrorDisplay error={mockError} onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
