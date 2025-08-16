import type { Todo } from '../types'

export interface UseDragAndDropReturn {
  draggedItem: Todo | null
  dragOverItem: Todo | null
  handleDragStart: (todo: Todo) => void
  handleDragOver: (e: DragEvent, todo: Todo) => void
  handleDrop: (e: DragEvent) => void
  handleDragEnd: () => void
}

export const useDragAndDrop = (): UseDragAndDropReturn => {
  // Placeholder implementation
  return {
    draggedItem: null,
    dragOverItem: null,
    handleDragStart: (todo: Todo) => {
      console.log('Drag start:', todo)
    },
    handleDragOver: (_e: DragEvent, todo: Todo) => {
      console.log('Drag over:', todo)
    },
    handleDrop: (e: DragEvent) => {
      console.log('Drop:', e)
    },
    handleDragEnd: () => {
      console.log('Drag end')
    },
  }
}
