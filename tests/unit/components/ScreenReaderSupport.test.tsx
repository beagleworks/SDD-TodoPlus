import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TodoItem } from '../../../src/components/TodoItem'
import { TodoList } from '../../../src/components/TodoList'
import { TodoInput } from '../../../src/components/TodoInput'
import { CompletionCommentModal } from '../../../src/components/CompletionCommentModal'
import type { Todo } from '../../../src/types'

const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  status: 'not_started',
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 1,
}

describe('Accessibility - Screen Reader Support', () => {
  describe('TodoItem screen reader support', () => {
    it('should provide comprehensive screen reader information', () => {
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
        isDragging: false,
        dragHandleProps: {},
      }

      render(<TodoItem {...mockProps} />)

      // Should have descriptive aria-label
      const todoItem = screen.getByRole('listitem')
      expect(todoItem).toHaveAttribute(
        'aria-label',
        'Todo item: Test Todo, status: not_started'
      )

      // Should have live region for dynamic announcements
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
      expect(liveRegion).toHaveClass('sr-only')
    })

    it('should announce drag state changes to screen readers', () => {
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
        isDragging: true,
        dragHandleProps: {},
      }

      render(<TodoItem {...mockProps} />)

      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveTextContent('Dragging Test Todo')
    })

    it('should announce drag over state to screen readers', () => {
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
        isDragging: false,
        isDragOver: true,
        dragHandleProps: {},
      }

      render(<TodoItem {...mockProps} />)

      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveTextContent('Drop zone active for Test Todo')
    })

    it('should provide screen reader instructions for editing', async () => {
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

      // Should have instructions for screen readers
      const instructions = screen.getByText(
        'Press Enter to save, Escape to cancel'
      )
      expect(instructions).toHaveClass('sr-only')
      expect(instructions).toHaveAttribute('id', 'edit-instructions')

      const editInput = screen.getByRole('textbox')
      expect(editInput).toHaveAttribute('aria-describedby', 'edit-instructions')
    })

    it('should provide status description for screen readers', () => {
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
        isDragging: false,
        dragHandleProps: {},
      }

      render(<TodoItem {...mockProps} />)

      const statusDescription = screen.getByText(/current status:/i)
      expect(statusDescription).toHaveClass('sr-only')
      expect(statusDescription).toHaveAttribute('id', 'status-description')

      const statusSelect = screen.getByRole('combobox')
      expect(statusSelect).toHaveAttribute(
        'aria-describedby',
        'status-description'
      )
    })
  })

  describe('TodoList screen reader support', () => {
    it('should provide semantic list structure', () => {
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
      expect(list).toHaveAttribute('aria-label', 'Todo list')

      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBeGreaterThan(0)
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

    it('should provide context for filtered lists', () => {
      const todos = [
        { ...mockTodo, id: '1', status: 'completed' as const },
        { ...mockTodo, id: '2', status: 'not_started' as const },
      ]
      const mockProps = {
        todos,
        filter: 'completed' as const,
        onUpdateTodo: vi.fn(),
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
      }

      render(<TodoList {...mockProps} />)

      // Should only show completed todos
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBeGreaterThan(0)

      const list = screen.getByRole('list')
      expect(list).toHaveAttribute('aria-label', 'Todo list')
    })
  })

  describe('TodoInput screen reader support', () => {
    it('should provide comprehensive form accessibility', () => {
      render(<TodoInput onAddTodo={vi.fn()} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Todo title')
      expect(input).toHaveAttribute('aria-required', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'add-todo-instructions')

      const instructions = screen.getByText(
        /enter a todo title and press enter/i
      )
      expect(instructions).toHaveClass('sr-only')
      expect(instructions).toHaveAttribute('id', 'add-todo-instructions')

      const button = screen.getByRole('button', { name: /add todo/i })
      expect(button).toHaveAttribute(
        'aria-describedby',
        'add-todo-instructions'
      )
    })

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={vi.fn()} />)

      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button', { name: /add todo/i })

      // Try to submit empty input
      await user.click(button)

      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
      expect(errorMessage).toHaveAttribute('id', 'todo-input-error')
      expect(errorMessage).toHaveTextContent('Title is required')

      expect(input).toHaveAttribute('aria-describedby', 'todo-input-error')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('CompletionCommentModal screen reader support', () => {
    it('should provide modal accessibility features', () => {
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSave: vi.fn(),
        initialComment: '',
      }

      render(<CompletionCommentModal {...mockProps} />)

      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute(
        'aria-labelledby',
        'completion-comment-title'
      )
      expect(modal).toHaveAttribute(
        'aria-describedby',
        'completion-comment-description'
      )
      expect(modal).toHaveAttribute('aria-modal', 'true')

      const title = screen.getByText(/completion comment/i)
      expect(title).toHaveAttribute('id', 'completion-comment-title')

      const description = screen.getByText(
        /add a comment about completing this task/i
      )
      expect(description).toHaveAttribute(
        'id',
        'completion-comment-description'
      )
    })

    it('should manage focus for screen readers', async () => {
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSave: vi.fn(),
        initialComment: '',
      }

      render(<CompletionCommentModal {...mockProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-label', 'Completion comment')
      expect(textarea).toHaveAttribute(
        'aria-describedby',
        'completion-comment-description'
      )

      // Should have proper focus management attributes
      expect(textarea).toBeInTheDocument()

      // Wait for focus to be set (async operation)
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(document.activeElement).toBe(textarea)
    })

    it('should provide keyboard navigation instructions', () => {
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSave: vi.fn(),
        initialComment: '',
      }

      render(<CompletionCommentModal {...mockProps} />)

      const instructions = screen.getByText(/press escape to close/i)
      expect(instructions).toHaveClass('sr-only')
    })
  })

  describe('Dynamic content announcements', () => {
    it('should announce todo status changes', async () => {
      const user = userEvent.setup()
      const onUpdateTodo = vi.fn()
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo,
        onDeleteTodo: vi.fn(),
        onPostToX: vi.fn(),
        isDragging: false,
        dragHandleProps: {},
      }

      render(<TodoItem {...mockProps} />)

      const statusSelect = screen.getByRole('combobox')
      await user.selectOptions(statusSelect, 'in_progress')

      expect(onUpdateTodo).toHaveBeenCalledWith('1', { status: 'in_progress' })

      // Status description should be updated
      const statusDescription = screen.getByText(/current status:/i)
      expect(statusDescription).toBeInTheDocument()
    })

    it('should announce todo deletion', async () => {
      const user = userEvent.setup()
      const onDeleteTodo = vi.fn()
      const mockProps = {
        todo: mockTodo,
        onUpdateTodo: vi.fn(),
        onDeleteTodo,
        onPostToX: vi.fn(),
        isDragging: false,
        dragHandleProps: {},
      }

      render(<TodoItem {...mockProps} />)

      const deleteButton = screen.getByRole('button', {
        name: /delete test todo/i,
      })
      await user.click(deleteButton)

      expect(onDeleteTodo).toHaveBeenCalledWith('1')
    })
  })
})
