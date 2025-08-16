import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TodoInput } from '../../../src/components/TodoInput'

describe('TodoInput', () => {
  const mockOnAddTodo = vi.fn()

  beforeEach(() => {
    mockOnAddTodo.mockClear()
  })

  describe('Empty input validation', () => {
    it('should not call onAddTodo when input is empty', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const addButton = screen.getByRole('button', { name: /add todo/i })
      await user.click(addButton)

      expect(mockOnAddTodo).not.toHaveBeenCalled()
    })

    it('should not call onAddTodo when input contains only whitespace', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const input = screen.getByRole('textbox')
      const addButton = screen.getByRole('button', { name: /add todo/i })

      await user.type(input, '   ')
      await user.click(addButton)

      expect(mockOnAddTodo).not.toHaveBeenCalled()
    })

    it('should show validation error when trying to add empty todo', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const addButton = screen.getByRole('button', { name: /add todo/i })
      await user.click(addButton)

      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })
  })

  describe('Character limit validation', () => {
    it('should not call onAddTodo when title exceeds 200 characters', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const input = screen.getByRole('textbox')
      const addButton = screen.getByRole('button', { name: /add todo/i })
      const longTitle = 'a'.repeat(201) // 201 characters

      await user.type(input, longTitle)
      await user.click(addButton)

      expect(mockOnAddTodo).not.toHaveBeenCalled()
    })

    it('should show validation error when title exceeds 200 characters', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const input = screen.getByRole('textbox')
      const addButton = screen.getByRole('button', { name: /add todo/i })
      const longTitle = 'a'.repeat(201) // 201 characters

      await user.type(input, longTitle)
      await user.click(addButton)

      expect(
        screen.getByText(/title must be 200 characters or less/i)
      ).toBeInTheDocument()
    })

    it('should call onAddTodo when title is exactly 200 characters', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const input = screen.getByRole('textbox')
      const addButton = screen.getByRole('button', { name: /add todo/i })
      const maxTitle = 'a'.repeat(200) // Exactly 200 characters

      await user.type(input, maxTitle)
      await user.click(addButton)

      expect(mockOnAddTodo).toHaveBeenCalledWith(maxTitle)
    })

    it('should clear error message when user starts typing valid input', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const input = screen.getByRole('textbox')
      const addButton = screen.getByRole('button', { name: /add todo/i })

      // First trigger an error
      await user.click(addButton)
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()

      // Then start typing
      await user.type(input, 'Valid todo')
      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Successful todo creation', () => {
    it('should call onAddTodo with trimmed title and clear input', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const input = screen.getByRole('textbox')
      const addButton = screen.getByRole('button', { name: /add todo/i })

      await user.type(input, '  Valid Todo  ')
      await user.click(addButton)

      expect(mockOnAddTodo).toHaveBeenCalledWith('Valid Todo')
      expect(input).toHaveValue('')
    })

    it('should handle Enter key press to submit', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const input = screen.getByRole('textbox')

      await user.type(input, 'Todo via Enter')
      await user.keyboard('{Enter}')

      expect(mockOnAddTodo).toHaveBeenCalledWith('Todo via Enter')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button', { name: /add todo/i })

      expect(input).toHaveAttribute('aria-label', 'Todo title')
      expect(input).toHaveAttribute('aria-invalid', 'false')
      expect(button).toHaveAttribute('aria-label', 'Add todo')
    })

    it('should update ARIA attributes when there is an error', async () => {
      const user = userEvent.setup()
      render(<TodoInput onAddTodo={mockOnAddTodo} />)

      const input = screen.getByRole('textbox')
      const addButton = screen.getByRole('button', { name: /add todo/i })

      await user.click(addButton)

      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'todo-input-error')

      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveAttribute('id', 'todo-input-error')
      expect(errorElement).toHaveAttribute('aria-live', 'polite')
    })
  })
})
