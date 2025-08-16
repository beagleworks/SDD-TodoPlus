import { useState, useCallback } from 'react'
import type { Todo } from '../../types'
import './TodoItem.css'

interface TodoItemProps {
  todo: Todo
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void
  onDeleteTodo: (id: string) => void
  onPostToX: (todo: Todo) => void
  isDragging: boolean
  isDragOver?: boolean
  dragHandleProps: React.HTMLAttributes<HTMLButtonElement>
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
  isDragging,
  isDragOver,
  dragHandleProps,
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

  const handleDragHandleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // Trigger drag functionality via keyboard
      // This would typically start a keyboard-based drag mode
    }
  }, [])

  // Drag and drop styling helpers
  const getClassName = useCallback(() => {
    const classes = ['todo-item']
    if (isDragging) classes.push('dragging')
    if (isDragOver) classes.push('drag-over')
    return classes.join(' ')
  }, [isDragging, isDragOver])

  const getStyle = useCallback((): React.CSSProperties => {
    const style: React.CSSProperties = {}
    if (isDragging) {
      style.opacity = 0.5
      style.transform = 'rotate(2deg)'
    }
    return style
  }, [isDragging])

  // Screen reader announcement content
  const getScreenReaderAnnouncement = useCallback(() => {
    if (isDragging) return `Dragging ${todo.title}`
    if (isDragOver) return `Drop zone active for ${todo.title}`
    return ''
  }, [isDragging, isDragOver, todo.title])

  return (
    <div
      className={getClassName()}
      style={getStyle()}
      role="listitem"
      aria-selected={isDragging}
      aria-label={`Todo item: ${todo.title}, status: ${todo.status}`}
    >
      <button
        {...dragHandleProps}
        aria-label="Drag to reorder"
        className="drag-handle"
        onKeyDown={handleDragHandleKeyDown}
        tabIndex={0}
      >
        ⋮⋮
      </button>
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
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {getScreenReaderAnnouncement()}
      </div>
    </div>
  )
}
