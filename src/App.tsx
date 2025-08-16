import { ErrorBoundary } from './components/ErrorBoundary'
import { TodoHeader } from './components/TodoHeader'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import { postToTwitter } from './utils/twitter'
import type { Todo } from './types'
import './styles/index.css'

function App() {
  const { state, actions } = useTodos()

  const handlePostToX = (todo: Todo) => {
    try {
      postToTwitter(todo)
    } catch (error) {
      console.error('Failed to post to X:', error)
      // You could show a user-friendly error message here
      alert('Failed to post to X (Twitter). Please try again.')
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
