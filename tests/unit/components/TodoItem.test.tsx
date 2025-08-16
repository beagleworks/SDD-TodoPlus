import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TodoItem } from '../../../src/components/TodoItem'
import type { Todo } from '../../../src/types'

const createMockTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '1',
  title: 'Test Todo',
  status: 'not_started',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  order: 1,
  ...overrides,
})

const createMockProps = (todoOverrides: Partial<Todo> = {}) => ({
  todo: createMockTodo(todoOverrides),
  onUpdateTodo: vi.fn(),
  onDeleteTodo: vi.fn(),
  onPostToX: vi.fn(),
  isDragging: false,
  dragHandleProps: {},
})

describe('TodoItem', () => {
  let mockProps: ReturnType<typeof createMockProps>

  beforeEach(() => {
    mockProps = createMockProps()
  })

  describe('Todo表示機能', () => {
    it('should display todo title', () => {
      render(<TodoItem {...mockProps} />)

      expect(screen.getByText('Test Todo')).toBeInTheDocument()
    })

    it('should display todo status as not_started', () => {
      render(<TodoItem {...mockProps} />)

      expect(screen.getByText('not_started')).toBeInTheDocument()
    })

    it('should display todo status as in_progress', () => {
      const props = createMockProps({ status: 'in_progress' })
      render(<TodoItem {...props} />)

      expect(screen.getByText('in_progress')).toBeInTheDocument()
    })

    it('should display todo status as completed', () => {
      const props = createMockProps({ status: 'completed' })
      render(<TodoItem {...props} />)

      expect(screen.getByText('completed')).toBeInTheDocument()
    })

    it('should display completion comment when todo is completed', () => {
      const props = createMockProps({
        status: 'completed',
        completionComment: 'Task completed successfully',
      })
      render(<TodoItem {...props} />)

      expect(
        screen.getByText('Task completed successfully')
      ).toBeInTheDocument()
    })

    it('should not display completion comment when todo is not completed', () => {
      const props = createMockProps({
        status: 'not_started',
        completionComment: 'This should not be visible',
      })
      render(<TodoItem {...props} />)

      expect(
        screen.queryByText('This should not be visible')
      ).not.toBeInTheDocument()
    })
  })

  describe('Todo編集機能', () => {
    it('should enter edit mode when title is clicked', async () => {
      const user = userEvent.setup()
      render(<TodoItem {...mockProps} />)

      await user.click(screen.getByText('Test Todo'))

      expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument()
    })

    it('should save edited title when Enter is pressed', async () => {
      const user = userEvent.setup()
      const props = createMockProps()
      render(<TodoItem {...props} />)

      await user.click(screen.getByText('Test Todo'))

      const input = screen.getByDisplayValue('Test Todo')
      await user.clear(input)
      await user.type(input, 'Updated Todo')
      await user.keyboard('{Enter}')

      expect(props.onUpdateTodo).toHaveBeenCalledWith('1', {
        title: 'Updated Todo',
      })
    })

    it('should cancel editing when Escape is pressed', async () => {
      const user = userEvent.setup()
      const props = createMockProps()
      render(<TodoItem {...props} />)

      await user.click(screen.getByText('Test Todo'))

      const input = screen.getByDisplayValue('Test Todo')
      await user.clear(input)
      await user.type(input, 'Updated Todo')
      await user.keyboard('{Escape}')

      expect(screen.getByText('Test Todo')).toBeInTheDocument()
      expect(props.onUpdateTodo).not.toHaveBeenCalled()
    })

    it('should save edited title when input loses focus', async () => {
      const user = userEvent.setup()
      const props = createMockProps()
      render(<TodoItem {...props} />)

      await user.click(screen.getByText('Test Todo'))

      const input = screen.getByDisplayValue('Test Todo')
      await user.clear(input)
      await user.type(input, 'Updated Todo')
      await user.tab() // Move focus away

      expect(props.onUpdateTodo).toHaveBeenCalledWith('1', {
        title: 'Updated Todo',
      })
    })

    it('should not save empty title', async () => {
      const user = userEvent.setup()
      const props = createMockProps()
      render(<TodoItem {...props} />)

      await user.click(screen.getByText('Test Todo'))

      const input = screen.getByDisplayValue('Test Todo')
      await user.clear(input)
      await user.keyboard('{Enter}')

      expect(screen.getByText('Test Todo')).toBeInTheDocument()
      expect(props.onUpdateTodo).not.toHaveBeenCalled()
    })
  })

  describe('Todo削除機能', () => {
    it('should call onDeleteTodo when delete button is clicked', async () => {
      const user = userEvent.setup()
      const props = createMockProps()
      render(<TodoItem {...props} />)

      await user.click(screen.getByText('Delete'))

      expect(props.onDeleteTodo).toHaveBeenCalledWith('1')
    })

    it('should display delete button', () => {
      render(<TodoItem {...mockProps} />)

      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('ステータス変更機能', () => {
    it('should call onUpdateTodo when status is clicked to change from not_started to in_progress', async () => {
      const user = userEvent.setup()
      const props = createMockProps({ status: 'not_started' })
      render(<TodoItem {...props} />)

      await user.click(screen.getByText('not_started'))

      expect(props.onUpdateTodo).toHaveBeenCalledWith('1', {
        status: 'in_progress',
      })
    })

    it('should call onUpdateTodo when status is clicked to change from in_progress to completed', async () => {
      const user = userEvent.setup()
      const props = createMockProps({ status: 'in_progress' })
      render(<TodoItem {...props} />)

      await user.click(screen.getByText('in_progress'))

      expect(props.onUpdateTodo).toHaveBeenCalledWith('1', {
        status: 'completed',
      })
    })

    it('should call onUpdateTodo when status is clicked to change from completed to not_started', async () => {
      const user = userEvent.setup()
      const props = createMockProps({ status: 'completed' })
      render(<TodoItem {...props} />)

      await user.click(screen.getByText('completed'))

      expect(props.onUpdateTodo).toHaveBeenCalledWith('1', {
        status: 'not_started',
      })
    })

    it('should display status as clickable element', () => {
      render(<TodoItem {...mockProps} />)

      expect(screen.getByText('not_started')).toBeInTheDocument()
    })
  })
})
