import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from '../../../src/App'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders todo app header', () => {
      render(<App />)
      expect(screen.getByText('Todo App')).toBeInTheDocument()
    })

    it('renders todo input after loading', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]')
      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Add new todo...')
        ).toBeInTheDocument()
      })
    })

    it('renders add todo button after loading', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]')
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Add Todo')).toBeInTheDocument()
      })
    })
  })

  describe('Data Loading', () => {
    it('should load initial todos from localStorage on mount', async () => {
      const mockTodos = [
        {
          id: '1',
          title: 'Test Todo 1',
          status: 'not_started' as const,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          order: 0,
        },
        {
          id: '2',
          title: 'Test Todo 2',
          status: 'completed' as const,
          completionComment: 'Done!',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
          order: 1,
        },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTodos))

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      })

      expect(screen.getByText('Test Todo 2')).toBeInTheDocument()
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('todo-app-data')
    })

    it('should handle empty localStorage gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Todo App')).toBeInTheDocument()
      })

      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('should handle corrupted localStorage data gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Todo App')).toBeInTheDocument()
      })

      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('should show loading state during initial data load', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('[]'), 100)
        })
      })

      render(<App />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })
    })

    it('should handle data loading errors gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied')
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(/error loading data/i)).toBeInTheDocument()
      })

      expect(screen.getByText('Todo App')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /refresh/i })
      ).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should provide todo context to all child components', async () => {
      const mockTodos = [
        {
          id: '1',
          title: 'Context Test Todo',
          status: 'not_started' as const,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          order: 0,
        },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTodos))

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Context Test Todo')).toBeInTheDocument()
      })

      expect(
        screen.getByRole('combobox', { name: /todo status/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /post.*to x/i })
      ).toBeInTheDocument()
    })

    it('should enable component communication through shared context', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]')

      const { container } = render(<App />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Add new todo...')
        ).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('Add new todo...')
      const addButton = screen.getByText('Add Todo')

      expect(input).toBeInTheDocument()
      expect(addButton).toBeInTheDocument()
      expect(
        container.querySelector('[role="list"]') ||
          screen.getByText('No todos found')
      ).toBeInTheDocument()
    })

    it('should wrap components in error boundary for error handling', () => {
      render(<App />)

      const app = screen.getByRole('main')
      expect(app).toBeInTheDocument()
    })

    it('should enable adding todos through component communication', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]')
      const user = userEvent.setup()

      render(<App />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Add new todo...')
        ).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('Add new todo...')
      const addButton = screen.getByText('Add Todo')

      await user.type(input, 'Test integration todo')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Test integration todo')).toBeInTheDocument()
      })

      expect(
        screen.getByRole('combobox', { name: /todo status/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /post.*to x/i })
      ).toBeInTheDocument()
    })

    it('should enable status changes through component integration', async () => {
      const mockTodos = [
        {
          id: '1',
          title: 'Integration Test Todo',
          status: 'not_started' as const,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          order: 0,
        },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTodos))
      const user = userEvent.setup()

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Integration Test Todo')).toBeInTheDocument()
      })

      const statusSelect = screen.getByRole('combobox', {
        name: /todo status/i,
      })
      expect(statusSelect).toHaveValue('not_started')

      await user.selectOptions(statusSelect, 'in_progress')

      await waitFor(() => {
        expect(statusSelect).toHaveValue('in_progress')
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })
})
