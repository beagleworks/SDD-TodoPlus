import type { Todo } from '../../types'

interface TodoActionsProps {
  todo: Todo
  onEdit: () => void
  onDelete: () => void
  onPostToX: () => void
}

export const TodoActions = ({
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
