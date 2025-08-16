import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useDragAndDrop } from '../../../src/hooks/useDragAndDrop'
import type { Todo } from '../../../src/types/todo'

// Mock DragEvent for testing environment
class MockDragEvent extends Event {
  constructor(type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict)
  }

  preventDefault = vi.fn()
}

// Make DragEvent available globally
;(globalThis as unknown as { DragEvent: typeof MockDragEvent }).DragEvent =
  MockDragEvent

// Mock todo data for testing
const mockTodo1: Todo = {
  id: '1',
  title: 'Test Todo 1',
  status: 'not_started',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  order: 1,
}

const mockTodo2: Todo = {
  id: '2',
  title: 'Test Todo 2',
  status: 'in_progress',
  createdAt: new Date('2023-01-02'),
  updatedAt: new Date('2023-01-02'),
  order: 2,
}

describe('useDragAndDrop', () => {
  describe('ドラッグ開始時の状態管理', () => {
    it('should track dragged item when drag starts', () => {
      const { result } = renderHook(() => useDragAndDrop())

      act(() => {
        result.current.handleDragStart(mockTodo1)
      })

      expect(result.current.draggedItem).toBe(mockTodo1)
      expect(result.current.dragOverItem).toBe(null)
    })

    it('should clear drag state when drag ends', () => {
      const { result } = renderHook(() => useDragAndDrop())

      // Start drag
      act(() => {
        result.current.handleDragStart(mockTodo1)
      })

      expect(result.current.draggedItem).toBe(mockTodo1)

      // End drag
      act(() => {
        result.current.handleDragEnd()
      })

      expect(result.current.draggedItem).toBe(null)
      expect(result.current.dragOverItem).toBe(null)
    })

    it('should handle multiple drag starts by updating dragged item', () => {
      const { result } = renderHook(() => useDragAndDrop())

      act(() => {
        result.current.handleDragStart(mockTodo1)
      })

      expect(result.current.draggedItem).toBe(mockTodo1)

      act(() => {
        result.current.handleDragStart(mockTodo2)
      })

      expect(result.current.draggedItem).toBe(mockTodo2)
    })
  })

  describe('ドラッグ中の状態管理', () => {
    it('should track drag over item', () => {
      const { result } = renderHook(() => useDragAndDrop())
      const mockEvent = new DragEvent('dragover', { bubbles: true })

      act(() => {
        result.current.handleDragOver(mockEvent, mockTodo2)
      })

      expect(result.current.dragOverItem).toBe(mockTodo2)
    })

    it('should prevent default drag over behavior', () => {
      const { result } = renderHook(() => useDragAndDrop())
      const mockEvent = new DragEvent('dragover', { bubbles: true })
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault')

      act(() => {
        result.current.handleDragOver(mockEvent, mockTodo2)
      })

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should update drag over item when dragging over different items', () => {
      const { result } = renderHook(() => useDragAndDrop())
      const mockEvent = new DragEvent('dragover', { bubbles: true })

      act(() => {
        result.current.handleDragOver(mockEvent, mockTodo1)
      })

      expect(result.current.dragOverItem).toBe(mockTodo1)

      act(() => {
        result.current.handleDragOver(mockEvent, mockTodo2)
      })

      expect(result.current.dragOverItem).toBe(mockTodo2)
    })
  })

  describe('ドロップ時の並び替えロジック', () => {
    it('should handle drop with reorder callback', () => {
      const mockOnReorder = vi.fn()
      const { result } = renderHook(() => useDragAndDrop(mockOnReorder))
      const mockEvent = new DragEvent('drop', { bubbles: true })

      // Set up drag state
      act(() => {
        result.current.handleDragStart(mockTodo1)
        result.current.handleDragOver(mockEvent, mockTodo2)
      })

      act(() => {
        result.current.handleDrop(mockEvent)
      })

      expect(mockOnReorder).toHaveBeenCalledWith(mockTodo1, mockTodo2)
    })

    it('should prevent default drop behavior', () => {
      const mockOnReorder = vi.fn()
      const { result } = renderHook(() => useDragAndDrop(mockOnReorder))
      const mockEvent = new DragEvent('drop', { bubbles: true })
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault')

      act(() => {
        result.current.handleDrop(mockEvent)
      })

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should clear drag state after drop', () => {
      const mockOnReorder = vi.fn()
      const { result } = renderHook(() => useDragAndDrop(mockOnReorder))
      const mockEvent = new DragEvent('drop', { bubbles: true })

      // Set up drag state
      act(() => {
        result.current.handleDragStart(mockTodo1)
        result.current.handleDragOver(mockEvent, mockTodo2)
      })

      act(() => {
        result.current.handleDrop(mockEvent)
      })

      expect(result.current.draggedItem).toBe(null)
      expect(result.current.dragOverItem).toBe(null)
    })

    it('should not call onReorder when no dragged item', () => {
      const mockOnReorder = vi.fn()
      const { result } = renderHook(() => useDragAndDrop(mockOnReorder))
      const mockEvent = new DragEvent('drop', { bubbles: true })

      act(() => {
        result.current.handleDrop(mockEvent)
      })

      expect(mockOnReorder).not.toHaveBeenCalled()
    })

    it('should not call onReorder when no drag over item', () => {
      const mockOnReorder = vi.fn()
      const { result } = renderHook(() => useDragAndDrop(mockOnReorder))
      const mockEvent = new DragEvent('drop', { bubbles: true })

      act(() => {
        result.current.handleDragStart(mockTodo1)
        result.current.handleDrop(mockEvent)
      })

      expect(mockOnReorder).not.toHaveBeenCalled()
    })

    it('should not call onReorder when no callback provided', () => {
      const { result } = renderHook(() => useDragAndDrop())
      const mockEvent = new DragEvent('drop', { bubbles: true })

      act(() => {
        result.current.handleDragStart(mockTodo1)
        result.current.handleDragOver(mockEvent, mockTodo2)
        result.current.handleDrop(mockEvent)
      })

      // Should not throw error and should clear state
      expect(result.current.draggedItem).toBe(null)
      expect(result.current.dragOverItem).toBe(null)
    })

    it('should not call onReorder when dragging item onto itself', () => {
      const mockOnReorder = vi.fn()
      const { result } = renderHook(() => useDragAndDrop(mockOnReorder))
      const mockEvent = new DragEvent('drop', { bubbles: true })

      act(() => {
        result.current.handleDragStart(mockTodo1)
        result.current.handleDragOver(mockEvent, mockTodo1)
        result.current.handleDrop(mockEvent)
      })

      expect(mockOnReorder).not.toHaveBeenCalled()
      expect(result.current.draggedItem).toBe(null)
      expect(result.current.dragOverItem).toBe(null)
    })
  })
})
