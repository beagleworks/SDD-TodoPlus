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
  if (!isOpen) return null

  return (
    <div>
      <div>
        <h3>Add Completion Comment</h3>
        <textarea defaultValue={initialComment} />
        <button onClick={() => onSave('Comment')}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
