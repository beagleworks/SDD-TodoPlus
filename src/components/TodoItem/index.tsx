import type { Todo } from '../../types'

interface TodoItemProps {
  todo: Todo
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void
  onDeleteTodo: (id: string) => void
  onPostToX: (todo: Todo) => void
  isDragging: boolean
  dragHandleProps: unknown
}

export const TodoItem = ({
  todo,
  onUpdateTodo: _onUpdateTodo,
  onDeleteTodo,
  onPostToX,
  isDragging: _isDragging,
  dragHandleProps: _dragHandleProps,
}: TodoItemProps) => {
  return (
    <div>
      <span>{todo.title}</span>
      <span>{todo.status}</span>
      <button onClick={() => onDeleteTodo(todo.id)}>Delete</button>
      <button onClick={() => onPostToX(todo)}>Post to X</button>
    </div>
  )
}
