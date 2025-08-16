import { ErrorBoundary } from './components/ErrorBoundary'
import { TodoHeader } from './components/TodoHeader'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import './styles/index.css'

function App() {
  const { state, actions } = useTodos()

  return (
    <ErrorBoundary>
      <div className="app">
        <TodoHeader />
        <TodoInput onAddTodo={actions.addTodo} />
        <TodoList todos={state.todos} />
      </div>
    </ErrorBoundary>
  )
}

export default App
