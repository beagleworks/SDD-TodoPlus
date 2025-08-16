import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from '../../../src/App'
import type { Todo } from '../../../src/types'

// Mock the Twitter utility
vi.mock('../../../src/utils/twitter', () => ({
  postToTwitter: vi.fn(),
  generateTweetText: vi.fn(
    (todo: Todo) => `タスク: ${todo.title} - ステータス: 完了`
  ),
  getStatusText: vi.fn((status: string) => {
    const statusMap: Record<string, string> = {
      not_started: '未実行',
      in_progress: '実行中',
      completed: '完了',
    }
    return statusMap[status] || status
  }),
}))

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

describe('Twitter Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('should integrate Twitter posting functionality end-to-end', async () => {
    const { postToTwitter } = await import('../../../src/utils/twitter')
    const user = userEvent.setup()

    render(<App />)

    // Add a new todo
    const input = screen.getByPlaceholderText('Add new todo...')
    await user.type(input, 'Test Twitter Integration')

    // Click the Add Todo button instead of pressing Enter
    const addButton = screen.getByText('Add Todo')
    await user.click(addButton)

    // Find the Post to X button for the new todo
    const postButton = screen.getByText('Post to X')
    expect(postButton).toBeInTheDocument()

    // Click the Post to X button
    await user.click(postButton)

    // Verify that postToTwitter was called
    expect(postToTwitter).toHaveBeenCalledTimes(1)
    expect(postToTwitter).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Twitter Integration',
        status: 'not_started',
      })
    )
  })

  it('should handle Twitter posting errors gracefully', async () => {
    const { postToTwitter } = await import('../../../src/utils/twitter')
    const mockedPostToTwitter = vi.mocked(postToTwitter)
    mockedPostToTwitter.mockImplementation(() => {
      throw new Error('X (Twitter) is not available')
    })

    // Mock window.alert
    const alertSpy = vi
      .spyOn(window, 'alert')
      .mockImplementation(() => undefined)

    const user = userEvent.setup()
    render(<App />)

    // Add a new todo
    const input = screen.getByPlaceholderText('Add new todo...')
    await user.type(input, 'Test Error Handling')

    // Click the Add Todo button
    const addButton = screen.getByText('Add Todo')
    await user.click(addButton)

    // Click the Post to X button
    const postButton = screen.getByText('Post to X')
    await user.click(postButton)

    // Verify error handling
    expect(postToTwitter).toHaveBeenCalledTimes(1)
    expect(alertSpy).toHaveBeenCalledWith(
      'Failed to post to X (Twitter). Please try again.'
    )

    alertSpy.mockRestore()
  })
})
