export interface Todo {
  id: string
  title: string
  status: 'not_started' | 'in_progress' | 'completed'
  completionComment?: string
  createdAt: Date
  updatedAt: Date
  order: number
}

export interface TodoState {
  todos: Todo[]
  filter: 'all' | 'not_started' | 'in_progress' | 'completed'
}

export type TodoAction =
  | { type: 'ADD_TODO'; payload: { title: string } }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: Partial<Todo> } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'REORDER_TODOS'; payload: { todos: Todo[] } }
  | { type: 'SET_FILTER'; payload: { filter: TodoState['filter'] } }
  | { type: 'LOAD_TODOS'; payload: { todos: Todo[] } }
