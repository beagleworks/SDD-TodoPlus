import type { Todo } from '../../types'

interface TodoListProps {
  todos: Todo[]
}

export const TodoList = ({ todos }: TodoListProps) => {
  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  )
}
