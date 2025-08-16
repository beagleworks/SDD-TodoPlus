import { useMemo, memo } from 'react'
import type { Todo, TodoState } from '../../types'
import { TodoItem } from '../TodoItem'

interface TodoListProps {
  todos: Todo[]
  filter: TodoState['filter']
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void
  onDeleteTodo: (id: string) => void
  onPostToX: (todo: Todo) => void
}

const TodoListComponent = ({
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

// Custom comparison function for React.memo
const areEqual = (prevProps: TodoListProps, nextProps: TodoListProps) => {
  // Check if todos array is the same reference or has same content
  if (prevProps.todos !== nextProps.todos) {
    if (prevProps.todos.length !== nextProps.todos.length) {
      return false
    }
    for (let i = 0; i < prevProps.todos.length; i++) {
      if (prevProps.todos[i] !== nextProps.todos[i]) {
        return false
      }
    }
  }

  // Check other props
  return (
    prevProps.filter === nextProps.filter &&
    prevProps.onUpdateTodo === nextProps.onUpdateTodo &&
    prevProps.onDeleteTodo === nextProps.onDeleteTodo &&
    prevProps.onPostToX === nextProps.onPostToX
  )
}

export const TodoList = memo(TodoListComponent, areEqual)
