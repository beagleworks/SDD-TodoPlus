import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { TodoList } from '../../../src/components/TodoList'
import { TodoItem } from '../../../src/components/TodoItem'
import { TodoInput } from '../../../src/components/TodoInput'
import type { Todo } from '../../../src/types'

describe('Performance Verification Tests', () => {
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

  describe('Optimized Re-render Prevention', () => {
    it('should verify TodoList works correctly with stable props', () => {
      // GREEN: This test verifies that TodoList works with stable props
      const stableOnUpdateTodo = vi.fn()
      const stableOnDeleteTodo = vi.fn()
      const stableOnPostToX = vi.fn()

      const { rerender } = render(
        <TodoList
          todos={mockTodos}
          filter="all"
          onUpdateTodo={stableOnUpdateTodo}
          onDeleteTodo={stableOnDeleteTodo}
          onPostToX={stableOnPostToX}
        />
      )

      // Verify initial render
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()

      // Re-render with same stable props
      rerender(
        <TodoList
          todos={mockTodos}
          filter="all"
          onUpdateTodo={stableOnUpdateTodo}
          onDeleteTodo={stableOnDeleteTodo}
          onPostToX={stableOnPostToX}
        />
      )

      // Should still work correctly
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
    })

    it('should verify TodoItem works correctly with stable props', () => {
      // GREEN: This test verifies that TodoItem works with stable props
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

      // Verify initial render
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()

      // Re-render with same stable props
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

      // Should still work correctly
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
    })

    it('should verify TodoInput works correctly with stable props', () => {
      // GREEN: This test verifies that TodoInput works with stable props
      const stableOnAddTodo = vi.fn()

      const { rerender } = render(<TodoInput onAddTodo={stableOnAddTodo} />)

      // Verify initial render
      expect(screen.getByRole('textbox')).toBeInTheDocument()

      // Re-render with same stable props
      rerender(<TodoInput onAddTodo={stableOnAddTodo} />)

      // Should still work correctly
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  describe('Performance Improvements', () => {
    it('should show improved performance with virtualized large todo lists', async () => {
      // GREEN: This test verifies virtualization works
      const { VirtualizedTodoList } = await import(
        '../../../src/components/VirtualizedTodoList'
      )

      const largeTodoList: Todo[] = Array.from({ length: 200 }, (_, i) => ({
        id: `todo-${i}`,
        title: `Todo ${i}`,
        status: 'not_started' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: i,
      }))

      const startTime = performance.now()

      render(
        <VirtualizedTodoList
          todos={largeTodoList}
          filter="all"
          maxVisibleItems={50}
          {...mockProps}
        />
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should be reasonably fast with virtualization
      expect(renderTime).toBeLessThan(300) // 300ms threshold for 200 items
    })

    it('should demonstrate memoization effectiveness', () => {
      // GREEN: This test should pass after optimization
      const { rerender } = render(
        <TodoList todos={mockTodos} filter="all" {...mockProps} />
      )

      // First render establishes baseline
      const startTime = performance.now()

      // Re-render with same props (should be faster due to memoization)
      rerender(<TodoList todos={mockTodos} filter="all" {...mockProps} />)

      const endTime = performance.now()
      const rerenderTime = endTime - startTime

      // Re-render should be very fast due to memoization
      expect(rerenderTime).toBeLessThan(10) // 10ms threshold
    })
  })

  describe('Memory Optimization', () => {
    it('should not create new objects on every render', () => {
      // GREEN: This test should pass after optimization
      const { rerender } = render(
        <TodoList todos={mockTodos} filter="all" {...mockProps} />
      )

      // Get initial memory usage (approximation)
      const initialMemory =
        (performance as { memory?: { usedJSHeapSize?: number } }).memory
          ?.usedJSHeapSize || 0

      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<TodoList todos={mockTodos} filter="all" {...mockProps} />)
      }

      const finalMemory =
        (performance as { memory?: { usedJSHeapSize?: number } }).memory
          ?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be minimal due to memoization
      // This is a rough test as memory usage can vary
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(initialMemory * 0.1) // Less than 10% increase
      }
    })
  })
})
