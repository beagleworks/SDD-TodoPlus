import { useState, useCallback } from 'react'
import type { Todo } from '../types'

export interface UseDragAndDropReturn {
  draggedItem: Todo | null
  dragOverItem: Todo | null
  handleDragStart: (todo: Todo) => void
  handleDragOver: (e: DragEvent, todo: Todo) => void
  handleDrop: (e: DragEvent) => void
  handleDragEnd: () => void
}

/**
 * Custom hook for managing drag and drop functionality for Todo items
 * @param onReorder - Optional callback function called when items are reordered
 * @returns Object containing drag state and event handlers
 */
export const useDragAndDrop = (
  onReorder?: (draggedItem: Todo, targetItem: Todo) => void
): UseDragAndDropReturn => {
  const [draggedItem, setDraggedItem] = useState<Todo | null>(null)
  const [dragOverItem, setDragOverItem] = useState<Todo | null>(null)

  const handleDragStart = useCallback((todo: Todo) => {
    setDraggedItem(todo)
  }, [])

  const handleDragOver = useCallback((e: DragEvent, todo: Todo) => {
    e.preventDefault()
    setDragOverItem(todo)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()

      // Only trigger reorder if we have both items and a callback
      if (
        draggedItem &&
        dragOverItem &&
        onReorder &&
        draggedItem.id !== dragOverItem.id
      ) {
        onReorder(draggedItem, dragOverItem)
      }

      // Always clear drag state after drop
      setDraggedItem(null)
      setDragOverItem(null)
    },
    [draggedItem, dragOverItem, onReorder]
  )

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDragOverItem(null)
  }, [])

  return {
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  }
}
