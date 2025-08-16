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

describe('Accessibility - Keyboard Navigation', () => {
  describe('TodoItem keyboard navigation', () => {
    it('should support keyboard navigation for drag handle', async () => {
      const user = userEvent.setup()
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
        isDragging: false,
        dragHandleProps: {
          onKeyDown: vi.fn(),
        },
      }

      render(<TodoItem {...mockProps} />)

      const dragHandle = screen.getByRole('button', {
        name: /drag to reorder/i,
      })

      // Should be focusable
      expect(dragHandle).toHaveAttribute('tabIndex', '0')

      // Should respond to Enter key
      await user.type(dragHandle, '{Enter}')
      expect(mockProps.dragHandleProps.onKeyDown).toHaveBeenCalled()

      // Should respond to Space key
      await user.type(dragHandle, ' ')
      expect(mockProps.dragHandleProps.onKeyDown).toHaveBeenCalled()
    })

    it('should support keyboard navigation in edit mode', async () => {
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

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit test todo/i })
      await user.click(editButton)

      const editInput = screen.getByRole('textbox')

      // Should support Enter to save
      await user.clear(editInput)
      await user.type(editInput, 'Updated Todo')
      await user.type(editInput, '{Enter}')

      expect(mockProps.onUpdateTodo).toHaveBeenCalledWith('1', {
        title: 'Updated Todo',
      })
    })

    it('should support Escape to cancel edit mode', async () => {
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

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit test todo/i })
      await user.click(editButton)

      const editInput = screen.getByRole('textbox')

      // Should support Escape to cancel
      await user.clear(editInput)
      await user.type(editInput, 'Should not save')
      await user.type(editInput, '{Escape}')

      // Should not call onUpdateTodo
      expect(mockProps.onUpdateTodo).not.toHaveBeenCalled()

      // Should exit edit mode
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('should support keyboard navigation for action buttons', async () => {
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

      // All action buttons should be focusable
      const editButton = screen.getByRole('button', { name: /edit test todo/i })
      const deleteButton = screen.getByRole('button', {
        name: /delete test todo/i,
      })
      const postButton = screen.getByRole('button', {
        name: /post test todo to x/i,
      })

      // Should be able to tab through buttons
      await user.tab()
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: /drag to reorder/i })
      )

      await user.tab()
      expect(document.activeElement).toBe(screen.getByRole('combobox'))

      await user.tab()
      expect(document.activeElement).toBe(editButton)

      await user.tab()
      expect(document.activeElement).toBe(deleteButton)

      await user.tab()
      expect(document.activeElement).toBe(postButton)
    })
  })

  describe('TodoInput keyboard navigation', () => {
    it('should support Enter key to add todo', async () => {
      const user = userEvent.setup()
      const onAddTodo = vi.fn()

      render(<TodoInput onAddTodo={onAddTodo} />)

      const input = screen.getByRole('textbox')

      await user.type(input, 'New Todo')
      await user.type(input, '{Enter}')

      expect(onAddTodo).toHaveBeenCalledWith('New Todo')
    })

    it('should support Tab navigation between input and button', async () => {
      const user = userEvent.setup()
      const onAddTodo = vi.fn()

      render(<TodoInput onAddTodo={onAddTodo} />)

      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button', { name: /add todo/i })

      // Focus should start on input
      await user.click(input)
      expect(document.activeElement).toBe(input)

      // Tab should move to button
      await user.tab()
      expect(document.activeElement).toBe(button)

      // Shift+Tab should move back to input
      await user.tab({ shift: true })
      expect(document.activeElement).toBe(input)
    })
  })

  describe('TodoList keyboard navigation', () => {
    it('should support keyboard navigation through todo items', async () => {
      const user = userEvent.setup()
      const todos = [
        { ...mockTodo, id: '1', title: 'Todo 1' },
        { ...mockTodo, id: '2', title: 'Todo 2' },
        { ...mockTodo, id: '3', title: 'Todo 3' },
      ]

      const mockProps = {
        todos,
        filter: 'all' as const,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
      }

      render(<TodoList {...mockProps} />)

      // Should be able to navigate through todo items using Tab
      const allDragHandles = screen.getAllByRole('button', {
        name: /drag to reorder/i,
      })
      // Ensure we have drag handles before accessing them
      expect(allDragHandles).toHaveLength(3)
      const firstDragHandle = allDragHandles[0]!
      await user.click(firstDragHandle)

      // Tab through first todo item elements
      expect(document.activeElement).toBe(firstDragHandle)

      await user.tab() // Status select
      await user.tab() // Edit button
      await user.tab() // Delete button
      await user.tab() // Post button
      await user.tab() // Next todo's drag handle

      // Ensure we have at least 2 drag handles before checking
      expect(allDragHandles).toHaveLength(3)
      expect(document.activeElement).toBe(allDragHandles[1])
    })
  })

  describe('TodoActions keyboard navigation', () => {
    it('should support keyboard activation of action buttons', async () => {
      const user = userEvent.setup()
      const mockProps = {
        todo: mockTodo,
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onPostToX: vi.fn(),
      }

      render(<TodoActions {...mockProps} />)

      const editButton = screen.getByRole('button', { name: /edit test todo/i })
      const deleteButton = screen.getByRole('button', {
        name: /delete test todo/i,
      })
      const postButton = screen.getByRole('button', {
        name: /post test todo to x/i,
      })

      // Should support Enter key activation
      await user.click(editButton)
      await user.type(editButton, '{Enter}')
      expect(mockProps.onEdit).toHaveBeenCalled()

      // Should support Space key activation
      await user.click(deleteButton)
      await user.type(deleteButton, ' ')
      expect(mockProps.onDelete).toHaveBeenCalled()

      // Should support Enter key activation for post button
      await user.click(postButton)
      await user.type(postButton, '{Enter}')
      expect(mockProps.onPostToX).toHaveBeenCalled()
    })
  })
})
