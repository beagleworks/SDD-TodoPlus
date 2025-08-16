import { useMemo } from 'react'
import type { Todo, TodoState } from '../../types'
import { TodoItem } from '../TodoItem'

interface TodoListProps {
  todos: Todo[]
  filter: TodoState['filter']
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void
  onDeleteTodo: (id: string) => void
  onPostToX: (todo: Todo) => void
}

export const TodoList = ({
  todos,
  filter,
  onUpdateTodo,
  onDeleteTodo,
  onPostToX,
}: TodoListProps) => {
  // Filter todos based on the filter prop
  const filteredTodos = useMemo(() => {
    if (filter === 'all') {
      return todos
    }
    return todos.filter((todo) => todo.status === filter)
  }, [todos, filter])

  if (filteredTodos.length === 0) {
    return (
      <div>
        <p role="status" aria-live="polite">
          No todos found
        </p>
      </div>
    )
  }

  return (
    <ul role="list" aria-label="Todo list">
      {filteredTodos.map((todo) => (
        <li key={todo.id}>
          <TodoItem
            todo={todo}
            onUpdateTodo={onUpdateTodo}
            onDeleteTodo={onDeleteTodo}
            onPostToX={onPostToX}
            isDragging={false}
            dragHandleProps={{}}
          />
        </li>
      ))}
    </ul>
  )
}
