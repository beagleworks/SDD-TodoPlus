import { useEffect, useState, useCallback, useMemo } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TodoHeader } from './components/TodoHeader'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import { postToTwitter } from './utils/twitter'
import { handleGlobalError, createNetworkError } from './utils/errorHandler'
import type { Todo } from './types'
import './styles/index.css'

function App() {
  const { state, actions } = useTodos()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const handlePostToX = useCallback((todo: Todo) => {
    try {
      postToTwitter(todo)
    } catch (error) {
      const networkError = createNetworkError(
        'Failed to post to X (Twitter). Please try again.',
        error
      )
      handleGlobalError(
        error instanceof Error ? error : new Error(String(error))
      )
      alert(networkError.message)
    }
  }, [])

  // Handle initial data loading
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true)
      setLoadError(null)

      // Test localStorage access to catch errors early
      window.localStorage.getItem('todo-app-data')

      // Simulate async data loading (in real app this might be from API)
      await new Promise((resolve) => setTimeout(resolve, 50))

      setIsLoading(false)
    } catch (error) {
      setLoadError('Error loading data. Please refresh the page.')
      setIsLoading(false)
      handleGlobalError(
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Set up global error handlers
  const handleUnhandledRejection = useCallback(
    (event: PromiseRejectionEvent) => {
      handleGlobalError(
        new Error(`Unhandled promise rejection: ${event.reason}`)
      )
      event.preventDefault()
    },
    []
  )

  const handleError = useCallback((event: ErrorEvent) => {
    handleGlobalError(event.error || new Error(event.message))
  }, [])

  useEffect(() => {
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [handleUnhandledRejection, handleError])

  // Memoize all components before any conditional returns
  const loadingComponent = useMemo(
    () => (
      <ErrorBoundary>
        <main className="app" role="main">
          <TodoHeader />
          <div>
            <p>Loading...</p>
          </div>
        </main>
      </ErrorBoundary>
    ),
    []
  )

  const errorComponent = useMemo(
    () => (
      <ErrorBoundary>
        <main className="app" role="main">
          <TodoHeader />
          <div>
            <p>Error loading data. Please refresh the page.</p>
            <button onClick={() => window.location.reload()}>Refresh</button>
          </div>
        </main>
      </ErrorBoundary>
    ),
    []
  )

  const appContent = useMemo(
    () => (
      <ErrorBoundary>
        <main className="app" role="main">
          <TodoHeader />
          <TodoInput onAddTodo={actions.addTodo} />
          <TodoList
            todos={state.todos}
            filter={state.filter}
            onUpdateTodo={actions.updateTodo}
            onDeleteTodo={actions.deleteTodo}
            onPostToX={handlePostToX}
          />
        </main>
      </ErrorBoundary>
    ),
    [
      state.todos,
      state.filter,
      actions.addTodo,
      actions.updateTodo,
      actions.deleteTodo,
      handlePostToX,
    ]
  )

  // Show loading state
  if (isLoading) {
    return loadingComponent
  }

  // Show error state
  if (loadError) {
    return errorComponent
  }

  return appContent
}

export default App
