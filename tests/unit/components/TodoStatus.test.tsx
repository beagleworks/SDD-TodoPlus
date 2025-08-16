import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { TodoStatus } from '../../../src/components/TodoStatus'
import type { Todo } from '../../../src/types'

describe('TodoStatus Component', () => {
  const mockOnStatusChange = vi.fn()

  beforeEach(() => {
    mockOnStatusChange.mockClear()
  })

  const renderTodoStatus = (status: Todo['status']) => {
    return render(
      <TodoStatus status={status} onStatusChange={mockOnStatusChange} />
    )
  }

  describe('Status Validation', () => {
    it('should reject invalid status values', () => {
      renderTodoStatus('not_started')
      const select = screen.getByRole('combobox')

      fireEvent.change(select, { target: { value: 'invalid_status' } })

      expect(mockOnStatusChange).not.toHaveBeenCalledWith('invalid_status')
    })

    it('should reject empty status values', () => {
      renderTodoStatus('not_started')
      const select = screen.getByRole('combobox')

      fireEvent.change(select, { target: { value: '' } })

      expect(mockOnStatusChange).not.toHaveBeenCalledWith('')
    })

    it('should prevent invalid transitions (completed -> not_started)', () => {
      renderTodoStatus('completed')
      const select = screen.getByRole('combobox')

      fireEvent.change(select, { target: { value: 'not_started' } })

      expect(mockOnStatusChange).not.toHaveBeenCalledWith('not_started')
    })
  })

  describe('Valid Status Transitions', () => {
    it('should allow not_started -> in_progress transition', () => {
      renderTodoStatus('not_started')
      const select = screen.getByRole('combobox')

      fireEvent.change(select, { target: { value: 'in_progress' } })

      expect(mockOnStatusChange).toHaveBeenCalledWith('in_progress')
    })

    it('should allow in_progress -> completed transition', () => {
      renderTodoStatus('in_progress')
      const select = screen.getByRole('combobox')

      fireEvent.change(select, { target: { value: 'completed' } })

      expect(mockOnStatusChange).toHaveBeenCalledWith('completed')
    })

    it('should allow not_started -> completed transition', () => {
      renderTodoStatus('not_started')
      const select = screen.getByRole('combobox')

      fireEvent.change(select, { target: { value: 'completed' } })

      expect(mockOnStatusChange).toHaveBeenCalledWith('completed')
    })
  })

  describe('Visual Styling and Accessibility', () => {
    const statusClassTests = [
      { status: 'not_started' as const, expectedClass: 'status-not-started' },
      { status: 'in_progress' as const, expectedClass: 'status-in-progress' },
      { status: 'completed' as const, expectedClass: 'status-completed' },
    ]

    statusClassTests.forEach(({ status, expectedClass }) => {
      it(`should apply correct CSS class for ${status} status`, () => {
        renderTodoStatus(status)
        const select = screen.getByRole('combobox')

        expect(select).toHaveClass(expectedClass)
        expect(select).toHaveClass('todo-status')
      })
    })

    it('should have proper ARIA attributes for accessibility', () => {
      renderTodoStatus('in_progress')
      const select = screen.getByRole('combobox')

      expect(select).toHaveAttribute('aria-label', 'Todo status')
      expect(select).toHaveAttribute('aria-describedby', 'status-description')
    })

    it('should provide screen reader description', () => {
      renderTodoStatus('in_progress')

      const description = document.getElementById('status-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent('Current status: in progress')
      expect(description).toHaveClass('sr-only')
    })
  })
})
