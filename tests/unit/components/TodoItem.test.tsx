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
  isDragOver: false,
  dragHandleProps: {
    draggable: true,
    onDragStart: vi.fn(),
  },
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

      const statusSelect = screen.getByRole('combobox', {
        name: /todo status/i,
      })
      expect(statusSelect).toHaveValue('not_started')
    })

    it('should display todo status as in_progress', () => {
      const props = createMockProps({ status: 'in_progress' })
      render(<TodoItem {...props} />)

      const statusSelect = screen.getByRole('combobox', {
        name: /todo status/i,
      })
      expect(statusSelect).toHaveValue('in_progress')
    })

    it('should display todo status as completed', () => {
      const props = createMockProps({ status: 'completed' })
      render(<TodoItem {...props} />)

      const statusSelect = screen.getByRole('combobox', {
        name: /todo status/i,
      })
      expect(statusSelect).toHaveValue('completed')
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
    it('should call onUpdateTodo when status is changed from not_started to in_progress', async () => {
      const user = userEvent.setup()
      const props = createMockProps({ status: 'not_started' })
      render(<TodoItem {...props} />)

      const statusSelect = screen.getByRole('combobox', {
        name: /todo status/i,
      })
      await user.selectOptions(statusSelect, 'in_progress')

      expect(props.onUpdateTodo).toHaveBeenCalledWith('1', {
        status: 'in_progress',
      })
    })

    it('should call onUpdateTodo when status is changed from in_progress to completed', async () => {
      const user = userEvent.setup()
      const props = createMockProps({ status: 'in_progress' })
      render(<TodoItem {...props} />)

      const statusSelect = screen.getByRole('combobox', {
        name: /todo status/i,
      })
      await user.selectOptions(statusSelect, 'completed')

      expect(props.onUpdateTodo).toHaveBeenCalledWith('1', {
        status: 'completed',
      })
    })

    it('should not allow changing status from completed to not_started (business rule)', async () => {
      const user = userEvent.setup()
      const props = createMockProps({ status: 'completed' })
      render(<TodoItem {...props} />)

      const statusSelect = screen.getByRole('combobox', {
        name: /todo status/i,
      })
      await user.selectOptions(statusSelect, 'not_started')

      // Should not call onUpdateTodo due to business rule validation
      expect(props.onUpdateTodo).not.toHaveBeenCalled()
      // Status should remain completed
      expect(statusSelect).toHaveValue('completed')
    })

    it('should display status as selectable element', () => {
      render(<TodoItem {...mockProps} />)

      const statusSelect = screen.getByRole('combobox', {
        name: /todo status/i,
      })
      expect(statusSelect).toBeInTheDocument()
      expect(statusSelect).toHaveValue('not_started')
    })
  })

  describe('ドラッグアンドドロップ機能', () => {
    describe('ドラッグハンドル機能', () => {
      it('should display drag handle button', () => {
        render(<TodoItem {...mockProps} />)

        expect(
          screen.getByRole('button', { name: /drag/i })
        ).toBeInTheDocument()
      })

      it('should have proper drag attributes on drag handle', () => {
        render(<TodoItem {...mockProps} />)

        const dragHandle = screen.getByRole('button', { name: /drag/i })
        expect(dragHandle).toHaveAttribute('draggable', 'true')
        expect(dragHandle).toHaveAttribute('tabindex', '0')
      })

      it('should trigger drag start when drag handle is used', async () => {
        const mockDragHandleProps = {
          onDragStart: vi.fn(),
          draggable: true,
        }
        const props = createMockProps()
        props.dragHandleProps = mockDragHandleProps

        render(<TodoItem {...props} />)

        const dragHandle = screen.getByRole('button', { name: /drag/i })

        // Simulate drag start
        const dragStartEvent = new Event('dragstart', { bubbles: true })
        dragHandle.dispatchEvent(dragStartEvent)
        expect(mockDragHandleProps.onDragStart).toHaveBeenCalled()
      })
    })

    describe('視覚的フィードバック機能', () => {
      it('should apply dragging class when isDragging is true', () => {
        const props = createMockProps()
        props.isDragging = true
        render(<TodoItem {...props} />)

        const todoItem = screen.getByRole('listitem')
        expect(todoItem).toHaveClass('dragging')
      })

      it('should apply visual feedback styles during drag', () => {
        const props = createMockProps()
        props.isDragging = true
        render(<TodoItem {...props} />)

        const todoItem = screen.getByRole('listitem')
        expect(todoItem).toHaveStyle('opacity: 0.5')
        expect(todoItem).toHaveStyle('transform: rotate(2deg)')
      })

      it('should show drag over state', () => {
        const props = createMockProps()
        props.isDragOver = true
        render(<TodoItem {...props} />)

        const todoItem = screen.getByRole('listitem')
        expect(todoItem).toHaveClass('drag-over')
      })

      it('should combine multiple visual states', () => {
        const props = createMockProps()
        props.isDragging = true
        props.isDragOver = true
        render(<TodoItem {...props} />)

        const todoItem = screen.getByRole('listitem')
        expect(todoItem).toHaveClass('todo-item', 'dragging', 'drag-over')
      })
    })

    describe('アクセシビリティ対応機能', () => {
      it('should support keyboard navigation for drag handle', async () => {
        const user = userEvent.setup()
        render(<TodoItem {...mockProps} />)

        const dragHandle = screen.getByRole('button', { name: /drag/i })

        // Test that drag handle is focusable
        await user.tab()
        expect(dragHandle).toHaveFocus()

        // Test keyboard activation (Enter and Space)
        await user.keyboard('{Enter}')
        await user.keyboard(' ')
        // These should not throw errors and handle keyboard events
      })

      it('should have proper ARIA attributes for drag and drop', () => {
        render(<TodoItem {...mockProps} />)

        const todoItem = screen.getByRole('listitem')

        expect(todoItem).toHaveAttribute('role', 'listitem')
        expect(todoItem).toHaveAttribute('aria-selected', 'false')
        expect(todoItem).toHaveAttribute('aria-label')
      })

      it('should update ARIA attributes during drag', () => {
        const props = createMockProps()
        props.isDragging = true
        render(<TodoItem {...props} />)

        const todoItem = screen.getByRole('listitem')

        expect(todoItem).toHaveAttribute('aria-selected', 'true')
      })

      it('should provide screen reader announcements', () => {
        render(<TodoItem {...mockProps} />)

        const srAnnouncement = screen.getByRole('status', { hidden: true })
        expect(srAnnouncement).toBeInTheDocument()
      })

      it('should announce drag state to screen readers', () => {
        const props = createMockProps()
        props.isDragging = true
        render(<TodoItem {...props} />)

        const srAnnouncement = screen.getByRole('status', { hidden: true })
        expect(srAnnouncement).toHaveTextContent(`Dragging ${props.todo.title}`)
      })

      it('should announce drag over state to screen readers', () => {
        const props = createMockProps()
        props.isDragOver = true
        render(<TodoItem {...props} />)

        const srAnnouncement = screen.getByRole('status', { hidden: true })
        expect(srAnnouncement).toHaveTextContent(
          `Drop zone active for ${props.todo.title}`
        )
      })
    })
  })
})
