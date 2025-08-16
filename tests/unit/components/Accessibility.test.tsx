import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TodoItem } from '../../../src/components/TodoItem'
import { TodoList } from '../../../src/components/TodoList'
import { TodoInput } from '../../../src/components/TodoInput'
import { TodoActions } from '../../../src/components/TodoActions'
import type { Todo } from '../../../src/types'

const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  status: 'not_started',
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 1,
}

describe('Accessibility - ARIA Attributes', () => {
  describe('TodoItem ARIA attributes', () => {
    it('should have proper ARIA attributes for screen readers', () => {
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
        isDragging: false,
        dragHandleProps: {},
      }

      render(<TodoItem {...mockProps} />)

      // Should have role="listitem"
      const todoItem = screen.getByRole('listitem')
      expect(todoItem).toBeInTheDocument()

      // Should have aria-label describing the todo
      expect(todoItem).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Test Todo')
      )
      expect(todoItem).toHaveAttribute(
        'aria-label',
        expect.stringContaining('not_started')
      )

      // Drag handle should have proper ARIA attributes
      const dragHandle = screen.getByRole('button', {
        name: /drag to reorder/i,
      })
      expect(dragHandle).toHaveAttribute('aria-label', 'Drag to reorder')
      expect(dragHandle).toHaveAttribute('tabIndex', '0')
    })

    it('should have proper ARIA attributes when dragging', () => {
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
        isDragging: true,
        dragHandleProps: {},
      }

      render(<TodoItem {...mockProps} />)

      const todoItem = screen.getByRole('listitem')
      expect(todoItem).toHaveAttribute('aria-selected', 'true')

      // Should have live region for screen reader announcements
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('should have proper ARIA attributes for editing mode', async () => {
      const user = userEvent.setup()
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
        isDragging: false,
        dragHandleProps: {},
      }

      render(<TodoItem {...mockProps} />)

      // Click edit button to enter edit mode
      const editButton = screen.getByRole('button', { name: /edit test todo/i })
      await user.click(editButton)

      // Should have proper input attributes
      const editInput = screen.getByRole('textbox')
      expect(editInput).toHaveAttribute('aria-label', 'Edit todo title')
      expect(editInput).toHaveAttribute('aria-describedby', 'edit-instructions')
    })
  })

  describe('TodoList ARIA attributes', () => {
    it('should have proper list semantics', () => {
      const todos = [mockTodo]
      const mockProps = {
        todos,
        filter: 'all' as const,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
      }

      render(<TodoList {...mockProps} />)

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()
      expect(list).toHaveAttribute('aria-label', 'Todo list')
    })

    it('should announce empty state to screen readers', () => {
      const mockProps = {
        todos: [],
        filter: 'all' as const,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
      }

      render(<TodoList {...mockProps} />)

      const emptyMessage = screen.getByText('No todos found')
      expect(emptyMessage).toHaveAttribute('role', 'status')
      expect(emptyMessage).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('TodoInput ARIA attributes', () => {
    it('should have proper form semantics', () => {
      render(<TodoInput onAddTodo={vi.fn()} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Todo title')
      expect(input).toHaveAttribute('aria-required', 'true')

      const addButton = screen.getByRole('button', { name: /add todo/i })
      expect(addButton).toHaveAttribute(
        'aria-describedby',
        'add-todo-instructions'
      )
    })
  })

  describe('TodoActions ARIA attributes', () => {
    it('should have descriptive button labels', () => {
      const mockProps = {
        todo: mockTodo,
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onPostToX: vi.fn(),
      }

      render(<TodoActions {...mockProps} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toHaveAttribute('aria-label', 'Edit Test Todo')

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete Test Todo')

      const postButton = screen.getByRole('button', {
        name: /post test todo to x/i,
      })
      expect(postButton).toHaveAttribute('aria-label', 'Post Test Todo to X')
    })
  })
})
