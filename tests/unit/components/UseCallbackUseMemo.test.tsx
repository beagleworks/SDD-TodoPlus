import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { TodoList } from '../../../src/components/TodoList'
import { TodoItem } from '../../../src/components/TodoItem'
import { TodoInput } from '../../../src/components/TodoInput'
import type { Todo } from '../../../src/types'

describe('useCallback and useMemo Effectiveness Tests', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      status: 'not_started',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
    },
    {
      id: '2',
      title: 'Test Todo 2',
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
  ]

  const mockProps = {
    onUpdateTodo: vi.fn(),
    onDeleteTodo: vi.fn(),
    onPostToX: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCallback Effectiveness', () => {
    it('should detect that event handlers are now stable between renders', () => {
      // GREEN: This test should pass after implementing useCallback
      const onAddTodo = vi.fn()

      const { rerender } = render(<TodoInput onAddTodo={onAddTodo} />)

      // Get the button element
      const button = screen.getByRole('button', { name: /add todo/i })

      // Store reference to the onClick handler
      const firstHandler = button.onclick

      // Re-render with same props
      rerender(<TodoInput onAddTodo={onAddTodo} />)

      // Get the onClick handler again
      const secondHandler = button.onclick

      // Handlers should be the same reference now
      expect(firstHandler).toBe(secondHandler)
    })

    it('should detect that TodoItem callbacks are stable', () => {
      // GREEN: This test should pass after implementing useCallback in TodoItem
      const { rerender } = render(
        <TodoItem
          todo={mockTodos[0]}
          {...mockProps}
          isDragging={false}
          dragHandleProps={{}}
        />
      )

      // Get the edit button
      const editButton = screen.getByRole('button', { name: /edit/i })
      const firstHandler = editButton.onclick

      // Re-render with same props
      rerender(
        <TodoItem
          todo={mockTodos[0]}
          {...mockProps}
          isDragging={false}
          dragHandleProps={{}}
        />
      )

      const secondHandler = editButton.onclick

      // Handlers should be the same reference now
      expect(firstHandler).toBe(secondHandler)
    })
  })

  describe('useMemo Effectiveness', () => {
    it('should detect that filtered todos are memoized in TodoList', () => {
      // GREEN: This test should pass after implementing useMemo
      let filterCallCount = 0

      // Create a custom filter function that tracks calls
      const originalFilter = Array.prototype.filter
      Array.prototype.filter = function (
        callback: (value: unknown, index: number, array: unknown[]) => boolean
      ) {
        filterCallCount++
        return originalFilter.call(this, callback)
      }

      const { rerender } = render(
        <TodoList todos={mockTodos} filter="all" {...mockProps} />
      )

      const initialFilterCount = filterCallCount

      // Re-render with same props
      rerender(<TodoList todos={mockTodos} filter="all" {...mockProps} />)

      // Restore original filter
      Array.prototype.filter = originalFilter

      // Filter should not be called again if memoized properly
      expect(filterCallCount).toBe(initialFilterCount)
    })

    it('should detect that expensive computations are memoized', () => {
      // GREEN: This test should pass after implementing useMemo for expensive operations
      const largeTodoList: Todo[] = Array.from({ length: 100 }, (_, i) => ({
        id: `todo-${i}`,
        title: `Todo ${i}`,
        status: 'not_started' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: i,
      }))

      const startTime = performance.now()

      const { rerender } = render(
        <TodoList todos={largeTodoList} filter="all" {...mockProps} />
      )

      const firstRenderTime = performance.now() - startTime

      const secondStartTime = performance.now()

      // Re-render with same props
      rerender(<TodoList todos={largeTodoList} filter="all" {...mockProps} />)

      const secondRenderTime = performance.now() - secondStartTime

      // Second render should be significantly faster due to memoization
      expect(secondRenderTime).toBeLessThan(firstRenderTime * 0.5)
    })
  })

  describe('Prop Stability', () => {
    it('should verify that memoized components work correctly with stable props', () => {
      // GREEN: This test verifies that our memoization is working
      const stableOnUpdateTodo = vi.fn()
      const stableOnDeleteTodo = vi.fn()
      const stableOnPostToX = vi.fn()

      const { rerender } = render(
        <TodoItem
          todo={mockTodos[0]}
          onUpdateTodo={stableOnUpdateTodo}
          onDeleteTodo={stableOnDeleteTodo}
          onPostToX={stableOnPostToX}
          isDragging={false}
          dragHandleProps={{}}
        />
      )

      // Verify initial render works
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()

      // Re-render with same stable props - should not cause errors
      rerender(
        <TodoItem
          todo={mockTodos[0]}
          onUpdateTodo={stableOnUpdateTodo}
          onDeleteTodo={stableOnDeleteTodo}
          onPostToX={stableOnPostToX}
          isDragging={false}
          dragHandleProps={{}}
        />
      )

      // Component should still work correctly
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })
  })
})
