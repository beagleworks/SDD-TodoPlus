import { memo } from 'react'
import type { Todo } from '../../types'

interface TodoActionsProps {
  todo: Todo
  onEdit: () => void
  onDelete: () => void
  onPostToX: () => void
}

const TodoActionsComponent = ({
  todo,
  onEdit,
  onDelete,
  onPostToX,
}: TodoActionsProps) => {
  return (
    <div>
      <button onClick={onEdit} aria-label={`Edit ${todo.title}`}>
        Edit
      </button>
      <button onClick={onDelete} aria-label={`Delete ${todo.title}`}>
        Delete
      </button>
      <button onClick={onPostToX} aria-label={`Post ${todo.title} to X`}>
        Post to X
      </button>
    </div>
  )
}

// Custom comparison function for React.memo
const areEqual = (prevProps: TodoActionsProps, nextProps: TodoActionsProps) => {
  return (
    prevProps.todo === nextProps.todo &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onPostToX === nextProps.onPostToX
  )
}

export const TodoActions = memo(TodoActionsComponent, areEqual)
