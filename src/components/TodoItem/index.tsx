import { useState, useCallback } from 'react'
import type { Todo } from '../../types'
import { TodoStatus } from '../TodoStatus'
import { TodoActions } from '../TodoActions'
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

  const handleStatusChange = useCallback(
    (newStatus: Todo['status']) => {
      onUpdateTodo(todo.id, { status: newStatus })
    },
    [todo.id, onUpdateTodo]
  )

  const handleDelete = useCallback(() => {
    onDeleteTodo(todo.id)
  }, [onDeleteTodo, todo.id])

  const handlePostToX = useCallback(() => {
    onPostToX(todo)
  }, [onPostToX, todo])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setEditValue(todo.title)
  }, [todo.title])

  const handleDragHandleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        // Trigger drag functionality via keyboard
        // This would typically start a keyboard-based drag mode
      }
      // Also call the provided onKeyDown handler if it exists
      if (dragHandleProps.onKeyDown) {
        dragHandleProps.onKeyDown(e as React.KeyboardEvent<HTMLButtonElement>)
      }
    },
    [dragHandleProps]
  )

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
        <>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            aria-label="Edit todo title"
            aria-describedby="edit-instructions"
          />
          <div id="edit-instructions" className="sr-only">
            Press Enter to save, Escape to cancel
          </div>
        </>
      ) : (
        <span onClick={handleTitleClick}>{todo.title}</span>
      )}
      <TodoStatus status={todo.status} onStatusChange={handleStatusChange} />
      {todo.status === 'completed' && todo.completionComment && (
        <span>{todo.completionComment}</span>
      )}
      <TodoActions
        todo={todo}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPostToX={handlePostToX}
      />
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
