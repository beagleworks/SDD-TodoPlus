import { useEffect } from 'react'
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

  // Set up global error handlers
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleGlobalError(
        new Error(`Unhandled promise rejection: ${event.reason}`)
      )
      event.preventDefault()
    }

    const handleError = (event: ErrorEvent) => {
      handleGlobalError(event.error || new Error(event.message))
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  const handlePostToX = (todo: Todo) => {
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

      // Show user-friendly error message
      alert(networkError.message)
    }
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <TodoHeader />
        <TodoInput onAddTodo={actions.addTodo} />
        <TodoList
          todos={state.todos}
          filter={state.filter}
          onUpdateTodo={actions.updateTodo}
          onDeleteTodo={actions.deleteTodo}
          onPostToX={handlePostToX}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
