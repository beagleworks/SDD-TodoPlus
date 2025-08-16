import { useState, useCallback } from 'react'
import { z } from 'zod'

interface TodoInputProps {
  onAddTodo: (title: string) => void
}

// Validation schema for todo title
const TodoTitleSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, 'Title is required')
  .refine((val) => val.length <= 200, 'Title must be 200 characters or less')

export const TodoInput = ({ onAddTodo }: TodoInputProps) => {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const validateAndSubmit = useCallback(() => {
    try {
      const validatedTitle = TodoTitleSchema.parse(title)

      setError('')
      onAddTodo(validatedTitle)
      setTitle('')
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.issues[0]?.message || 'Validation error')
      }
    }
  }, [title, onAddTodo])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value)
      // Clear error when user starts typing
      if (error) {
        setError('')
      }
    },
    [error]
  )

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        validateAndSubmit()
      }
    },
    [validateAndSubmit]
  )

  return (
    <div>
      <input
        type="text"
        placeholder="Add new todo..."
        value={title}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        aria-label="Todo title"
        aria-describedby={error ? 'todo-input-error' : undefined}
        aria-invalid={!!error}
      />
      <button onClick={validateAndSubmit} type="button" aria-label="Add todo">
        Add Todo
      </button>
      {error && (
        <div id="todo-input-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  )
}
