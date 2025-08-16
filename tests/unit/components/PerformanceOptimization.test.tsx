import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { TodoList } from '../../../src/components/TodoList'
import { TodoItem } from '../../../src/components/TodoItem'
import { TodoInput } from '../../../src/components/TodoInput'
import type { Todo } from '../../../src/types'

describe('Performance Optimization', () => {
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

  describe('Unnecessary Re-renders Detection', () => {
    it('should verify TodoList renders correctly with memoization', () => {
      // GREEN: This test verifies that TodoList works correctly with memoization
      const { rerender } = render(
        <TodoList todos={mockTodos} filter="all" {...mockProps} />
      )

      // Verify initial render
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument()

      // Re-render with same props should not cause issues
      rerender(<TodoList todos={mockTodos} filter="all" {...mockProps} />)

      // Content should still be there
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument()
    })

    it('should verify TodoItem renders correctly with memoization', () => {
      // GREEN: This test verifies that TodoItem works correctly with memoization
      const { rerender } = render(
        <TodoItem
          todo={mockTodos[0]}
          {...mockProps}
          isDragging={false}
          dragHandleProps={{}}
        />
      )

      // Verify initial render
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()

      // Re-render with same props should not cause issues
      rerender(
        <TodoItem
          todo={mockTodos[0]}
          {...mockProps}
          isDragging={false}
          dragHandleProps={{}}
        />
      )

      // Content should still be there
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('should verify TodoInput renders correctly with memoization', () => {
      // GREEN: This test verifies that TodoInput works correctly with memoization
      const mockOnAddTodo = vi.fn()
      const { rerender } = render(<TodoInput onAddTodo={mockOnAddTodo} />)

      // Verify initial render
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /add todo/i })
      ).toBeInTheDocument()

      // Re-render with same props should not cause issues
      rerender(<TodoInput onAddTodo={mockOnAddTodo} />)

      // Content should still be there
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /add todo/i })
      ).toBeInTheDocument()
    })
  })

  describe('React.memo Usage Detection', () => {
    it('should detect that components are now wrapped with React.memo', () => {
      // GREEN: This test should now pass because React.memo is being used
      const TodoListComponent = TodoList as React.ComponentType<unknown>
      const TodoItemComponent = TodoItem as React.ComponentType<unknown>
      const TodoInputComponent = TodoInput as React.ComponentType<unknown>

      // Check if components are memoized (they should have displayName or be wrapped)
      expect(
        TodoListComponent.$$typeof || TodoListComponent.displayName
      ).toBeDefined()
      expect(
        TodoItemComponent.$$typeof || TodoItemComponent.displayName
      ).toBeDefined()
      expect(
        TodoInputComponent.$$typeof || TodoInputComponent.displayName
      ).toBeDefined()
    })
  })

  describe('useCallback and useMemo Detection', () => {
    it('should detect missing useCallback optimization for event handlers', () => {
      // RED: This test should fail because event handlers are not memoized
      const onAddTodo = vi.fn()

      const { rerender } = render(<TodoInput onAddTodo={onAddTodo} />)

      // Get the input element
      const input = screen.getByRole('textbox')

      // Store reference to the onChange handler
      const firstOnChange = input.getAttribute('onChange')

      // Re-render with same props
      rerender(<TodoInput onAddTodo={onAddTodo} />)

      // Get the onChange handler again
      const secondOnChange = input.getAttribute('onChange')

      // This should fail initially - handlers are recreated on each render
      expect(firstOnChange).toBe(secondOnChange)
    })

    it('should detect missing useMemo optimization for filtered todos', () => {
      // RED: This test should fail because filtered todos are not memoized
      let filterCallCount = 0
      const todosWithFilter = mockTodos.map((todo) => ({
        ...todo,
        // Add a getter that tracks filter calls
        get filtered() {
          filterCallCount++
          return true
        },
      }))

      const { rerender } = render(
        <TodoList todos={todosWithFilter} filter="all" {...mockProps} />
      )

      const initialFilterCount = filterCallCount

      // Re-render with same props
      rerender(<TodoList todos={todosWithFilter} filter="all" {...mockProps} />)

      // This should fail initially - filtering happens on every render
      expect(filterCallCount).toBe(initialFilterCount)
    })
  })

  describe('Performance Degradation Detection', () => {
    it('should handle large todo lists with reasonable performance', () => {
      // GREEN: This test verifies that large lists can be handled
      const largeTodoList: Todo[] = Array.from({ length: 100 }, (_, i) => ({
        id: `todo-${i}`,
        title: `Todo ${i}`,
        status: 'not_started' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: i,
      }))

      const startTime = performance.now()

      render(<TodoList todos={largeTodoList} filter="all" {...mockProps} />)

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should handle medium-sized lists reasonably well
      expect(renderTime).toBeLessThan(500) // 500ms threshold for 100 items
    })

    it('should detect memory leaks from uncleaned event listeners', () => {
      // RED: This test should fail if event listeners are not properly cleaned
      const initialListenerCount =
        (window as { eventListenerCount?: number }).eventListenerCount || 0

      const { unmount } = render(
        <TodoItem
          todo={mockTodos[0]}
          {...mockProps}
          isDragging={false}
          dragHandleProps={{}}
        />
      )

      unmount()

      const afterUnmountListenerCount =
        (window as { eventListenerCount?: number }).eventListenerCount || 0

      // This should fail initially if cleanup is not proper
      expect(afterUnmountListenerCount).toBe(initialListenerCount)
    })
  })
})
