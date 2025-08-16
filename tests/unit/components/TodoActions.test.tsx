import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TodoActions } from '../../../src/components/TodoActions'
import type { Todo } from '../../../src/types'

describe('TodoActions', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Task',
    status: 'not_started',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 1,
  }

  const mockProps = {
    todo: mockTodo,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onPostToX: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render Post to X button', () => {
    render(<TodoActions {...mockProps} />)

    expect(screen.getByText('Post to X')).toBeInTheDocument()
  })

  it('should call onPostToX when Post to X button is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoActions {...mockProps} />)

    const postButton = screen.getByText('Post to X')
    await user.click(postButton)

    expect(mockProps.onPostToX).toHaveBeenCalledTimes(1)
  })

  it('should render all action buttons', () => {
    render(<TodoActions {...mockProps} />)

    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Post to X')).toBeInTheDocument()
  })

  it('should call respective handlers when buttons are clicked', async () => {
    const user = userEvent.setup()
    render(<TodoActions {...mockProps} />)

    await user.click(screen.getByText('Edit'))
    expect(mockProps.onEdit).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Delete'))
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Post to X'))
    expect(mockProps.onPostToX).toHaveBeenCalledTimes(1)
  })
})
