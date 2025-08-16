import { render, screen } from '@testing-library/react'
import { TodoList } from '../../../src/components/TodoList'
import type { Todo } from '../../../src/types'

// Mock TodoItem component to avoid complex integration testing
vi.mock('../../../src/components/TodoItem', () => ({
  TodoItem: ({ todo }: { todo: Todo }) => (
    <div data-testid={`todo-item-${todo.id}`}>{todo.title}</div>
  ),
}))

const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Not started todo',
    status: 'not_started',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    order: 0,
  },
  {
    id: '2',
    title: 'In progress todo',
    status: 'in_progress',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    order: 1,
  },
  {
    id: '3',
    title: 'Completed todo',
    status: 'completed',
    completionComment: 'Done!',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
    order: 2,
  },
]

const mockProps = {
  onUpdateTodo: vi.fn(),
  onDeleteTodo: vi.fn(),
  onPostToX: vi.fn(),
}

describe('TodoList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Empty list display', () => {
    it('should display empty state message when no todos are provided', () => {
      render(<TodoList todos={[]} filter="all" {...mockProps} />)

      expect(screen.getByText('No todos found')).toBeInTheDocument()
    })

    it('should not display any todo items when list is empty', () => {
      render(<TodoList todos={[]} filter="all" {...mockProps} />)

      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })
  })

  describe('Todo list display', () => {
    it('should display all todos when filter is "all"', () => {
      render(<TodoList todos={mockTodos} filter="all" {...mockProps} />)

      expect(screen.getByText('Not started todo')).toBeInTheDocument()
      expect(screen.getByText('In progress todo')).toBeInTheDocument()
      expect(screen.getByText('Completed todo')).toBeInTheDocument()
    })

    it('should display todos as list items', () => {
      render(<TodoList todos={mockTodos} filter="all" {...mockProps} />)

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })

    it('should render TodoItem components for each todo', () => {
      render(<TodoList todos={mockTodos} filter="all" {...mockProps} />)

      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('todo-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('todo-item-3')).toBeInTheDocument()
    })

    it('should render list with proper role attribute', () => {
      render(<TodoList todos={mockTodos} filter="all" {...mockProps} />)

      expect(screen.getByRole('list')).toBeInTheDocument()
    })
  })

  describe('Filtering functionality', () => {
    it('should display only not_started todos when filter is "not_started"', () => {
      render(<TodoList todos={mockTodos} filter="not_started" {...mockProps} />)

      expect(screen.getByText('Not started todo')).toBeInTheDocument()
      expect(screen.queryByText('In progress todo')).not.toBeInTheDocument()
      expect(screen.queryByText('Completed todo')).not.toBeInTheDocument()
    })

    it('should display only in_progress todos when filter is "in_progress"', () => {
      render(<TodoList todos={mockTodos} filter="in_progress" {...mockProps} />)

      expect(screen.queryByText('Not started todo')).not.toBeInTheDocument()
      expect(screen.getByText('In progress todo')).toBeInTheDocument()
      expect(screen.queryByText('Completed todo')).not.toBeInTheDocument()
    })

    it('should display only completed todos when filter is "completed"', () => {
      render(<TodoList todos={mockTodos} filter="completed" {...mockProps} />)

      expect(screen.queryByText('Not started todo')).not.toBeInTheDocument()
      expect(screen.queryByText('In progress todo')).not.toBeInTheDocument()
      expect(screen.getByText('Completed todo')).toBeInTheDocument()
    })

    it('should display empty state when no todos match the filter', () => {
      const notStartedTodos = mockTodos.filter(
        (todo) => todo.status === 'not_started'
      )
      render(
        <TodoList todos={notStartedTodos} filter="completed" {...mockProps} />
      )

      expect(screen.getByText('No todos found')).toBeInTheDocument()
    })

    it('should filter todos efficiently using useMemo', () => {
      const { rerender } = render(
        <TodoList todos={mockTodos} filter="all" {...mockProps} />
      )

      // Initial render should show all todos
      expect(screen.getAllByRole('listitem')).toHaveLength(3)

      // Rerender with same props should not cause unnecessary filtering
      rerender(<TodoList todos={mockTodos} filter="all" {...mockProps} />)
      expect(screen.getAllByRole('listitem')).toHaveLength(3)

      // Change filter should update display
      rerender(<TodoList todos={mockTodos} filter="completed" {...mockProps} />)
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
      expect(screen.getByText('Completed todo')).toBeInTheDocument()
    })
  })
})
