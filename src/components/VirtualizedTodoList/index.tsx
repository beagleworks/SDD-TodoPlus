import { useMemo, memo, useCallback } from 'react'
import type { Todo, TodoState } from '../../types'
import { TodoItem } from '../TodoItem'

interface VirtualizedTodoListProps {
  todos: Todo[]
  filter: TodoState['filter']
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void
  onDeleteTodo: (id: string) => void
  onPostToX: (todo: Todo) => void
  maxVisibleItems?: number
}

const VirtualizedTodoListComponent = ({
  todos,
  filter,
  onUpdateTodo,
  onDeleteTodo,
  onPostToX,
  maxVisibleItems = 50,
}: VirtualizedTodoListProps) => {
  // Filter todos based on the filter prop
  const filteredTodos = useMemo(() => {
    if (filter === 'all') {
      return todos
    }
    return todos.filter((todo) => todo.status === filter)
  }, [todos, filter])

  // Virtualize the list for performance with large datasets
  const visibleTodos = useMemo(() => {
    return filteredTodos.slice(0, maxVisibleItems)
  }, [filteredTodos, maxVisibleItems])

  const remainingCount = filteredTodos.length - visibleTodos.length

  const handleLoadMore = useCallback(() => {
    // This would typically trigger loading more items
    // For now, we'll just show a message
  }, [])

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
    <div>
      <ul role="list" aria-label="Todo list">
        {visibleTodos.map((todo) => (
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
      {remainingCount > 0 && (
        <div>
          <p>
            Showing {visibleTodos.length} of {filteredTodos.length} todos
          </p>
          <button onClick={handleLoadMore}>
            Load more ({remainingCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}

// Custom comparison function for React.memo
const areEqual = (
  prevProps: VirtualizedTodoListProps,
  nextProps: VirtualizedTodoListProps
) => {
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
    prevProps.onPostToX === nextProps.onPostToX &&
    prevProps.maxVisibleItems === nextProps.maxVisibleItems
  )
}

export const VirtualizedTodoList = memo(VirtualizedTodoListComponent, areEqual)
