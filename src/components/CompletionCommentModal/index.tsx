import { useState, useEffect, useRef } from 'react'
import './CompletionCommentModal.css'

interface CompletionCommentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (comment: string) => void
  initialComment?: string
}

export const CompletionCommentModal = ({
  isOpen,
  onClose,
  onSave,
  initialComment = '',
}: CompletionCommentModalProps) => {
  const [comment, setComment] = useState(initialComment)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset comment when modal opens or initialComment changes
  useEffect(() => {
    if (isOpen) {
      setComment(initialComment)
      // Focus textarea when modal opens
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }, [isOpen, initialComment])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      if (event.key === 'Escape') {
        onClose()
      } else if (event.ctrlKey && event.key === 'Enter') {
        onSave(comment)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, comment, onClose, onSave])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(comment)
  }

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComment(event.target.value)
  }

  return (
    <div
      className="completion-comment-modal-overlay"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div className="completion-comment-modal-content">
        <h3 id="modal-title" className="completion-comment-modal-title">
          Add Completion Comment
        </h3>
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={handleTextareaChange}
          placeholder="Enter completion comment (optional)"
          rows={4}
          className="completion-comment-modal-textarea"
          aria-label="Completion comment"
        />
        <div className="completion-comment-modal-actions">
          <button
            onClick={handleSave}
            className="completion-comment-modal-button completion-comment-modal-button--primary"
          >
            Save
          </button>
          <button onClick={onClose} className="completion-comment-modal-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
