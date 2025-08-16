import { useReducer, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { TodoState, TodoAction, Todo } from '../types'
import { useLocalStorage } from './useLocalStorage'

export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO': {
      if (!action.payload.title.trim()) {
        return state
      }

      const newTodo: Todo = {
        id: uuidv4(),
        title: action.payload.title,
        status: 'not_started',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: state.todos.length,
      }

      return {
        ...state,
        todos: [...state.todos, newTodo],
      }
    }
    case 'UPDATE_TODO': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, ...action.payload.updates, updatedAt: new Date() }
            : todo
        ),
      }
    }
    case 'DELETE_TODO': {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id),
      }
    }
    case 'REORDER_TODOS': {
      return {
        ...state,
        todos: action.payload.todos,
      }
    }
    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.payload.filter,
      }
    }
    case 'LOAD_TODOS': {
      return {
        ...state,
        todos: action.payload.todos,
      }
    }
    default:
      throw new Error(
        `Unknown action type: ${(action as { type: string }).type}`
      )
  }
}

interface UseTodosReturn {
  state: TodoState
  actions: {
    addTodo: (title: string) => void
    updateTodo: (id: string, updates: Partial<Todo>) => void
    deleteTodo: (id: string) => void
    reorderTodos: (todos: Todo[]) => void
    setFilter: (filter: TodoState['filter']) => void
  }
}

export function useTodos(): UseTodosReturn {
  const { value: storedTodos, setValue: setStoredTodos } = useLocalStorage<
    Todo[]
  >('todo-app-data', [])

  const initialState: TodoState = {
    todos: storedTodos,
    filter: 'all',
  }

  const [state, dispatch] = useReducer(todoReducer, initialState)

  // Sync todos to localStorage whenever they change
  const { todos } = state
  const syncToStorage = useCallback(() => {
    setStoredTodos(todos)
  }, [todos, setStoredTodos])

  const addTodo = useCallback((title: string) => {
    dispatch({ type: 'ADD_TODO', payload: { title } })
    // Storage sync will happen via useEffect
  }, [])

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    dispatch({ type: 'UPDATE_TODO', payload: { id, updates } })
  }, [])

  const deleteTodo = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: { id } })
  }, [])

  const reorderTodos = useCallback((todos: Todo[]) => {
    dispatch({ type: 'REORDER_TODOS', payload: { todos } })
  }, [])

  const setFilter = useCallback((filter: TodoState['filter']) => {
    dispatch({ type: 'SET_FILTER', payload: { filter } })
  }, [])

  // Sync to localStorage after state changes
  useEffect(() => {
    syncToStorage()
  }, [syncToStorage])

  return {
    state,
    actions: {
      addTodo,
      updateTodo,
      deleteTodo,
      reorderTodos,
      setFilter,
    },
  }
}
