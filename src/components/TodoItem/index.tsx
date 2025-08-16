import { useState, useCallback } from 'react'
import type { Todo } from '../../types'

interface TodoItemProps {
  todo: Todo
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void
  onDeleteTodo: (id: string) => void
  onPostToX: (todo: Todo) => void
  isDragging: boolean
  dragHandleProps: unknown
}

const getNextStatus = (currentStatus: Todo['status']): Todo['status'] => {
  const statusFlow: Record<Todo['status'], Todo['status']> = {
    not_started: 'in_progress',
    in_progress: 'completed',
    completed: 'not_started',
  }
  return statusFlow[currentStatus]
}

export const TodoItem = ({
  todo,
  onUpdateTodo,
  onDeleteTodo,
  onPostToX,
  isDragging: _isDragging,
  dragHandleProps: _dragHandleProps,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.title)

  const handleTitleClick = useCallback(() => {
    setIsEditing(true)
    setEditValue(todo.title)
  }, [todo.title])

  const handleSave = useCallback(() => {
    const trimmedValue = editValue.trim()
    if (trimmedValue) {
      onUpdateTodo(todo.id, { title: trimmedValue })
    }
    setIsEditing(false)
  }, [editValue, onUpdateTodo, todo.id])

  const handleCancel = useCallback(() => {
    setEditValue(todo.title)
    setIsEditing(false)
  }, [todo.title])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave()
      } else if (e.key === 'Escape') {
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  const handleStatusClick = useCallback(() => {
    const nextStatus = getNextStatus(todo.status)
    onUpdateTodo(todo.id, { status: nextStatus })
  }, [todo.status, todo.id, onUpdateTodo])

  const handleDelete = useCallback(() => {
    onDeleteTodo(todo.id)
  }, [onDeleteTodo, todo.id])

  const handlePostToX = useCallback(() => {
    onPostToX(todo)
  }, [onPostToX, todo])

  return (
    <div>
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
        />
      ) : (
        <span onClick={handleTitleClick}>{todo.title}</span>
      )}
      <span onClick={handleStatusClick}>{todo.status}</span>
      {todo.status === 'completed' && todo.completionComment && (
        <span>{todo.completionComment}</span>
      )}
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handlePostToX}>Post to X</button>
    </div>
  )
}
