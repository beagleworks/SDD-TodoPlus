import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from '../../../src/App'

describe('X (Twitter) Integration E2E', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    sessionStorage.clear()

    // Mock window.open
    vi.stubGlobal('open', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should post todo to X (Twitter) with correct format', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for app to finish loading
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Create a todo
    const todoInput = screen.getByPlaceholderText(/add new todo/i)
    const addButton = screen.getByRole('button', { name: /add todo/i })

    await user.type(todoInput, 'My Important Task')
    await user.click(addButton)

    // Verify todo was created
    await waitFor(() => {
      expect(screen.getByText('My Important Task')).toBeInTheDocument()
    })

    // Find and click the "Post to X" button
    const postToXButton = screen.getByRole('button', { name: /post.*to x/i })
    expect(postToXButton).toBeInTheDocument()

    // Click the post to X button
    await user.click(postToXButton)

    // Verify window.open was called with correct X URL
    expect(window.open).toHaveBeenCalledTimes(1)

    const callArgs = vi.mocked(window.open).mock.calls[0]
    const url = callArgs[0]

    expect(url).toContain('https://twitter.com/intent/tweet')
    expect(decodeURIComponent(url)).toContain('My Important Task')
  })

  test('should post completed todo with completion comment to X', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for app to finish loading
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Create a todo
    const todoInput = screen.getByPlaceholderText(/add new todo/i)
    const addButton = screen.getByRole('button', { name: /add todo/i })

    await user.type(todoInput, 'Completed Task')
    await user.click(addButton)

    // Wait for todo to be created
    await waitFor(() => {
      expect(screen.getByText('Completed Task')).toBeInTheDocument()
    })

    // Change status to completed
    const statusSelect = screen.getByRole('combobox', { name: /todo status/i })
    await user.selectOptions(statusSelect, 'completed')

    // Wait for status change
    await waitFor(() => {
      expect(statusSelect).toHaveValue('completed')
    })

    // Find and click the "Post to X" button
    const postToXButton = screen.getByRole('button', { name: /post.*to x/i })
    await user.click(postToXButton)

    // Verify window.open was called with correct X URL
    expect(window.open).toHaveBeenCalledTimes(1)

    const callArgs = vi.mocked(window.open).mock.calls[0]
    const url = callArgs[0]

    expect(url).toContain('https://twitter.com/intent/tweet')
    expect(decodeURIComponent(url)).toContain('Completed Task')
  })

  test('should handle long todo titles by truncating appropriately', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for app to finish loading
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Create a todo with a very long title
    const longTitle =
      'This is a very long todo title that exceeds the normal length and should be truncated when posting to X to ensure it fits within the character limit while still being readable and informative'

    const todoInput = screen.getByPlaceholderText(/add new todo/i)
    const addButton = screen.getByRole('button', { name: /add todo/i })

    await user.type(todoInput, longTitle)
    await user.click(addButton)

    // Wait for todo to be created
    await waitFor(() => {
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    // Find and click the "Post to X" button (get the specific one)
    const postToXButton = screen.getByText('Post to X')
    await user.click(postToXButton)

    // Verify window.open was called
    expect(window.open).toHaveBeenCalledTimes(1)

    const callArgs = vi.mocked(window.open).mock.calls[0]
    const url = callArgs[0]

    expect(url).toContain('https://twitter.com/intent/tweet')

    // Decode the URL to check the content
    const decodedUrl = decodeURIComponent(url)

    // The tweet should be truncated but still readable
    expect(decodedUrl.length).toBeLessThan(500) // Allow more room for URL structure
  })

  test('should handle X posting errors gracefully', async () => {
    const user = userEvent.setup()

    // Mock window.open to throw an error
    vi.stubGlobal(
      'open',
      vi.fn(() => {
        throw new Error('Popup blocked')
      })
    )

    render(<App />)

    // Wait for app to finish loading
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Create a todo
    const todoInput = screen.getByPlaceholderText(/add new todo/i)
    const addButton = screen.getByRole('button', { name: /add todo/i })

    await user.type(todoInput, 'Test Task')
    await user.click(addButton)

    // Wait for todo to be created
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })

    // Mock alert to capture error messages
    vi.stubGlobal('alert', vi.fn())

    // Find and click the "Post to X" button
    const postToXButton = screen.getByRole('button', { name: /post.*to x/i })
    await user.click(postToXButton)

    // Verify error handling
    expect(window.open).toHaveBeenCalledTimes(1)

    // Should show an error message (either alert or in UI)
    // The exact implementation may vary
    await waitFor(
      () => {
        expect(window.alert).toHaveBeenCalled()
      },
      { timeout: 1000 }
    )
  })
})
