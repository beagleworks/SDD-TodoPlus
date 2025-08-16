interface TodoInputProps {
  onAddTodo: (title: string) => void
}

export const TodoInput = ({ onAddTodo }: TodoInputProps) => {
  return (
    <div>
      <input type="text" placeholder="Add new todo..." />
      <button onClick={() => onAddTodo('New Todo')}>Add Todo</button>
    </div>
  )
}
