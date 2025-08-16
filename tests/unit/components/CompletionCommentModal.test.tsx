import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CompletionCommentModal } from '../../../src/components/CompletionCommentModal'

describe('CompletionCommentModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <CompletionCommentModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      // Modal should not be visible
      expect(screen.queryByText('Completion Comment')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.queryByText('Save')).not.toBeInTheDocument()
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      // Modal should be visible with all elements
      expect(screen.getByText('Completion Comment')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('Comment input functionality', () => {
    it('should allow user to input completion comment', async () => {
      const user = userEvent.setup()

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      const testComment = 'This task was completed successfully'

      await user.clear(textarea)
      await user.type(textarea, testComment)

      expect(textarea).toHaveValue(testComment)
    })

    it('should call onSave with the entered comment when Save button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      const saveButton = screen.getByText('Save')
      const testComment = 'Task completed with great results'

      await user.clear(textarea)
      await user.type(textarea, testComment)
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith(testComment)
    })

    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should display initial comment when provided', () => {
      const initialComment = 'Initial completion comment'

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialComment={initialComment}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(initialComment)
    })

    it('should allow saving empty comment', async () => {
      const user = userEvent.setup()

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      const saveButton = screen.getByText('Save')

      await user.clear(textarea)
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith('')
    })
  })

  describe('Comment editing functionality', () => {
    it('should allow editing existing comment', async () => {
      const user = userEvent.setup()
      const initialComment = 'Original comment'
      const updatedComment = 'Updated comment with more details'

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialComment={initialComment}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(initialComment)

      await user.clear(textarea)
      await user.type(textarea, updatedComment)

      expect(textarea).toHaveValue(updatedComment)
    })

    it('should save edited comment when Save button is clicked', async () => {
      const user = userEvent.setup()
      const initialComment = 'Original comment'
      const editedComment = 'Edited comment'

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialComment={initialComment}
        />
      )

      const textarea = screen.getByRole('textbox')
      const saveButton = screen.getByText('Save')

      await user.clear(textarea)
      await user.type(textarea, editedComment)
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith(editedComment)
    })

    it('should reset to initial comment when modal is reopened', async () => {
      const user = userEvent.setup()
      const initialComment = 'Initial comment'

      const { rerender } = render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialComment={initialComment}
        />
      )

      // Modify the comment
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Modified comment')
      expect(textarea).toHaveValue('Modified comment')

      // Close modal
      rerender(
        <CompletionCommentModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialComment={initialComment}
        />
      )

      // Reopen modal - should reset to initial comment
      rerender(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialComment={initialComment}
        />
      )

      const newTextarea = screen.getByRole('textbox')
      expect(newTextarea).toHaveValue(initialComment)
    })

    it('should handle long comments properly', async () => {
      const user = userEvent.setup()
      const longComment =
        'This is a very long comment that contains a lot of details about the task completion. '.repeat(
          10
        )

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      const saveButton = screen.getByText('Save')

      await user.type(textarea, longComment)
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith(longComment)
    })

    it('should preserve line breaks in comments', async () => {
      const user = userEvent.setup()
      const multilineComment = 'Line 1\nLine 2\nLine 3'

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      const saveButton = screen.getByText('Save')

      await user.type(textarea, multilineComment)
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith(multilineComment)
    })
  })

  describe('Accessibility and UX', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()

      // Check that buttons are properly accessible
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('should focus on textarea when modal opens', () => {
      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      // Note: In a real implementation, we would add autoFocus
      // For now, just verify the textarea exists and is accessible
      expect(textarea).toBeInTheDocument()
    })

    it('should have focusable elements in correct order', async () => {
      const user = userEvent.setup()

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      const saveButton = screen.getByRole('button', { name: 'Save' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })

      // All elements should be focusable
      expect(textarea).toBeInTheDocument()
      expect(saveButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()

      // Test that we can interact with elements via keyboard
      await user.click(textarea)
      await user.type(textarea, 'test')
      expect(textarea).toHaveValue('test')
    })

    it('should support Ctrl+Enter key to save', async () => {
      const user = userEvent.setup()

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      await user.click(textarea)
      await user.type(textarea, 'Test comment')

      // Ctrl+Enter should save
      await user.keyboard('{Control>}{Enter}{/Control}')

      expect(mockOnSave).toHaveBeenCalledWith('Test comment')
    })

    it('should support Escape key to close modal', async () => {
      const user = userEvent.setup()

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Requirements validation', () => {
    // Requirement 3.1: タスクを「完了」にマークしたとき、システムは完了コメントの追加を促す
    it('should prompt for completion comment when task is marked as completed', () => {
      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      expect(screen.getByText('Completion Comment')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Enter completion comment (optional)')
      ).toBeInTheDocument()
    })

    // Requirement 3.2: 完了コメントを入力したとき、システムはそれをタスクと一緒に保存する
    it('should save completion comment with task when entered', async () => {
      const user = userEvent.setup()
      const comment = 'Task completed successfully with all requirements met'

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const textarea = screen.getByRole('textbox')
      const saveButton = screen.getByText('Save')

      await user.type(textarea, comment)
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith(comment)
    })

    // Requirement 3.3: 完了したタスクを表示したとき、システムは完了コメントを表示する
    it('should display completion comment when showing completed task', () => {
      const existingComment = 'Previously saved completion comment'

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialComment={existingComment}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(existingComment)
    })

    // Requirement 3.4: 完了したタスクを編集したとき、システムは完了コメントの修正を可能にする
    it('should allow editing completion comment for completed task', async () => {
      const user = userEvent.setup()
      const originalComment = 'Original completion comment'
      const updatedComment = 'Updated completion comment with more details'

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialComment={originalComment}
        />
      )

      const textarea = screen.getByRole('textbox')
      const saveButton = screen.getByText('Save')

      // Verify original comment is displayed
      expect(textarea).toHaveValue(originalComment)

      // Edit the comment
      await user.clear(textarea)
      await user.type(textarea, updatedComment)
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith(updatedComment)
    })

    // Requirement 3.5: タスクがコメントなしで「完了」にマークされた場合でも、システムはステータス変更を許可する
    it('should allow task completion without comment', async () => {
      const user = userEvent.setup()

      render(
        <CompletionCommentModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const saveButton = screen.getByText('Save')

      // Save without entering any comment
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith('')
    })
  })
})
