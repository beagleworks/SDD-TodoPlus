import type { Todo } from '../../types'

interface TodoStatusProps {
  status: Todo['status']
  onStatusChange: (status: Todo['status']) => void
}

export const TodoStatus = ({ status, onStatusChange }: TodoStatusProps) => {
  return (
    <select
      value={status}
      onChange={(e) => onStatusChange(e.target.value as Todo['status'])}
    >
      <option value="not_started">Not Started</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  )
}
