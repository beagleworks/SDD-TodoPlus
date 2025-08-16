import type { Todo } from '../../types'

interface TodoActionsProps {
  todo: Todo
  onEdit: () => void
  onDelete: () => void
  onPostToX: () => void
}

export const TodoActions = ({
  todo: _todo,
  onEdit,
  onDelete,
  onPostToX,
}: TodoActionsProps) => {
  return (
    <div>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
      <button onClick={onPostToX}>Post to X</button>
    </div>
  )
}
