import { memo } from 'react'
import type { Todo } from '../../types'
import './TodoStatus.css'

interface TodoStatusProps {
  status: Todo['status']
  onStatusChange: (status: Todo['status']) => void
}

const VALID_STATUSES: Todo['status'][] = [
  'not_started',
  'in_progress',
  'completed',
]

const STATUS_LABELS: Record<Todo['status'], string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
}

/**
 * Validates if a string value is a valid Todo status
 */
const isValidStatus = (value: string): value is Todo['status'] => {
  return VALID_STATUSES.includes(value as Todo['status'])
}

/**
 * Validates if a status transition is allowed
 * Business rule: Don't allow going backwards from completed to not_started
 */
const isValidTransition = (
  currentStatus: Todo['status'],
  newStatus: Todo['status']
): boolean => {
  if (currentStatus === 'completed' && newStatus === 'not_started') {
    return false
  }
  return true
}

/**
 * Generates CSS class names for the status select element
 */
const getStatusClassName = (status: Todo['status']): string => {
  return `todo-status status-${status.replace('_', '-')}`
}

/**
 * Formats status for display (converts underscores to spaces)
 */
const formatStatusForDisplay = (status: Todo['status']): string => {
  return status.replace('_', ' ')
}

const TodoStatusComponent = ({ status, onStatusChange }: TodoStatusProps) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value

    // Validate the new status value
    if (!newValue || !isValidStatus(newValue)) {
      return
    }

    // Validate the transition
    if (!isValidTransition(status, newValue)) {
      return
    }

    onStatusChange(newValue)
  }

  return (
    <>
      <select
        value={status}
        onChange={handleStatusChange}
        className={getStatusClassName(status)}
        aria-label="Todo status"
        aria-describedby="status-description"
      >
        {VALID_STATUSES.map((statusValue) => (
          <option key={statusValue} value={statusValue}>
            {STATUS_LABELS[statusValue]}
          </option>
        ))}
      </select>
      <div id="status-description" className="sr-only">
        Current status: {formatStatusForDisplay(status)}
      </div>
    </>
  )
}

// Custom comparison function for React.memo
const areEqual = (prevProps: TodoStatusProps, nextProps: TodoStatusProps) => {
  return (
    prevProps.status === nextProps.status &&
    prevProps.onStatusChange === nextProps.onStatusChange
  )
}

export const TodoStatus = memo(TodoStatusComponent, areEqual)
