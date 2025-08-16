import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../../src/App'

describe('Main User Flow E2E', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  test('should complete full user flow: create → edit → complete todo', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for app to finish loading
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Step 1: Create a new todo
    const todoInput = screen.getByPlaceholderText(/add new todo/i)
    const addButton = screen.getByRole('button', { name: /add todo/i })

    await user.type(todoInput, 'Test Todo Item')
    await user.click(addButton)

    // Verify todo was created
    const todoItem = await screen.findByText('Test Todo Item')
    expect(todoItem).toBeInTheDocument()

    // Verify initial status is 'not_started'
    const statusSelect = screen.getByRole('combobox', { name: /todo status/i })
    expect(statusSelect).toBeInTheDocument()
    expect(statusSelect).toHaveValue('not_started')

    // Step 2: Edit the todo
    const editButton = screen.getByRole('button', {
      name: /edit test todo item/i,
    })
    await user.click(editButton)

    const editInput = screen.getByDisplayValue('Test Todo Item')
    await user.clear(editInput)
    await user.type(editInput, 'Updated Todo Item')

    // Save by pressing Enter (as indicated by the instructions)
    await user.keyboard('{Enter}')

    // Verify todo was updated
    expect(screen.getByText('Updated Todo Item')).toBeInTheDocument()
    expect(screen.queryByText('Test Todo Item')).not.toBeInTheDocument()

    // Step 3: Change status to in_progress
    const statusSelectAfterEdit = screen.getByRole('combobox', {
      name: /todo status/i,
    })
    await user.selectOptions(statusSelectAfterEdit, 'in_progress')

    // Verify status changed
    await waitFor(() => {
      expect(statusSelectAfterEdit).toHaveValue('in_progress')
    })

    // Step 4: Complete the todo
    await user.selectOptions(statusSelectAfterEdit, 'completed')

    // Verify todo is completed
    await waitFor(() => {
      expect(statusSelectAfterEdit).toHaveValue('completed')
    })

    // Check if completion comment modal appears or if there's another way to add comments
    // For now, let's verify the basic completion functionality works
    expect(screen.getByText('Updated Todo Item')).toBeInTheDocument()
    expect(statusSelectAfterEdit).toHaveValue('completed')
  })
})
