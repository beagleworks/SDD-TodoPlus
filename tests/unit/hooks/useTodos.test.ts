import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { todoReducer, useTodos } from '../../../src/hooks/useTodos'
import { TodoState, TodoAction, Todo } from '../../../src/types'

// Mock useLocalStorage
const mockSetValue = vi.fn()
vi.mock('../../../src/hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn(() => ({
    value: [],
    setValue: mockSetValue,
    removeValue: vi.fn(),
    error: null,
  })),
}))

describe('todoReducer', () => {
  const initialState: TodoState = {
    todos: [],
    filter: 'all',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw error for unknown action type', () => {
    const unknownAction = { type: 'UNKNOWN_ACTION' } as TodoAction

    expect(() => {
      todoReducer(initialState, unknownAction)
    }).toThrow('Unknown action type: UNKNOWN_ACTION')
  })

  it('should handle ADD_TODO action', () => {
    const action: TodoAction = {
      type: 'ADD_TODO',
      payload: { title: 'Test Todo' },
    }
    const result = todoReducer(initialState, action)

    expect(result.todos).toHaveLength(1)
    expect(result.todos[0]).toMatchObject({
      title: 'Test Todo',
      status: 'not_started',
      order: 0,
    })
  })

  it('should not add todo with empty title', () => {
    const action: TodoAction = { type: 'ADD_TODO', payload: { title: '   ' } }
    const result = todoReducer(initialState, action)

    expect(result.todos).toHaveLength(0)
  })

  it('should handle UPDATE_TODO action', () => {
    const existingTodo: Todo = {
      id: '1',
      title: 'Original',
      status: 'not_started',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
    }

    const stateWithTodo: TodoState = {
      todos: [existingTodo],
      filter: 'all',
    }

    const action: TodoAction = {
      type: 'UPDATE_TODO',
      payload: {
        id: '1',
        updates: { title: 'Updated', status: 'in_progress' },
      },
    }

    const result = todoReducer(stateWithTodo, action)

    expect(result.todos[0]).toMatchObject({
      title: 'Updated',
      status: 'in_progress',
    })
    expect(result.todos[0].updatedAt).toBeInstanceOf(Date)
  })

  it('should handle DELETE_TODO action', () => {
    const existingTodo: Todo = {
      id: '1',
      title: 'To Delete',
      status: 'not_started',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
    }

    const stateWithTodo: TodoState = {
      todos: [existingTodo],
      filter: 'all',
    }

    const action: TodoAction = { type: 'DELETE_TODO', payload: { id: '1' } }
    const result = todoReducer(stateWithTodo, action)

    expect(result.todos).toHaveLength(0)
  })
})

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add a new todo when addTodo is called', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      result.current.actions.addTodo('Test Todo')
    })

    expect(result.current.state.todos).toHaveLength(1)
    expect(result.current.state.todos[0]).toMatchObject({
      title: 'Test Todo',
      status: 'not_started',
    })
    expect(result.current.state.todos[0].id).toBeDefined()
    expect(result.current.state.todos[0].createdAt).toBeInstanceOf(Date)
    expect(result.current.state.todos[0].updatedAt).toBeInstanceOf(Date)
    expect(result.current.state.todos[0].order).toBe(0)
  })

  it('should not add todo with empty title', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      result.current.actions.addTodo('')
    })

    expect(result.current.state.todos).toHaveLength(0)
  })

  it('should update todo when updateTodo is called', () => {
    const { result } = renderHook(() => useTodos())

    // First add a todo
    act(() => {
      result.current.actions.addTodo('Test Todo')
    })

    const todoId = result.current.state.todos[0].id

    // Then update it
    act(() => {
      result.current.actions.updateTodo(todoId, {
        title: 'Updated Todo',
        status: 'in_progress',
      })
    })

    expect(result.current.state.todos[0]).toMatchObject({
      title: 'Updated Todo',
      status: 'in_progress',
    })
    expect(result.current.state.todos[0].updatedAt).toBeInstanceOf(Date)
  })

  it('should delete todo when deleteTodo is called', () => {
    const { result } = renderHook(() => useTodos())

    // First add a todo
    act(() => {
      result.current.actions.addTodo('Test Todo')
    })

    const todoId = result.current.state.todos[0].id

    // Then delete it
    act(() => {
      result.current.actions.deleteTodo(todoId)
    })

    expect(result.current.state.todos).toHaveLength(0)
  })

  it('should reorder todos when reorderTodos is called', () => {
    const { result } = renderHook(() => useTodos())

    // Add multiple todos
    act(() => {
      result.current.actions.addTodo('First Todo')
      result.current.actions.addTodo('Second Todo')
    })

    const [firstTodo, secondTodo] = result.current.state.todos
    const reorderedTodos = [secondTodo, firstTodo]

    // Reorder them
    act(() => {
      result.current.actions.reorderTodos(reorderedTodos)
    })

    expect(result.current.state.todos[0].title).toBe('Second Todo')
    expect(result.current.state.todos[1].title).toBe('First Todo')
  })

  it('should set filter when setFilter is called', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      result.current.actions.setFilter('completed')
    })

    expect(result.current.state.filter).toBe('completed')
  })

  it('should not update non-existent todo', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      result.current.actions.addTodo('Test Todo')
    })

    const originalTodo = result.current.state.todos[0]

    // Try to update non-existent todo
    act(() => {
      result.current.actions.updateTodo('non-existent-id', {
        title: 'Updated Todo',
      })
    })

    // Original todo should remain unchanged
    expect(result.current.state.todos[0]).toEqual(originalTodo)
  })

  it('should not delete non-existent todo', () => {
    const { result } = renderHook(() => useTodos())

    act(() => {
      result.current.actions.addTodo('Test Todo')
    })

    // Try to delete non-existent todo
    act(() => {
      result.current.actions.deleteTodo('non-existent-id')
    })

    // Todo should still exist
    expect(result.current.state.todos).toHaveLength(1)
  })
})
