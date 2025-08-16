import type { AppError } from '../../types/errors'
import {
  isRecoverableError,
  getErrorDisplayMessage,
} from '../../utils/errorHandler'
import './ErrorDisplay.css'

interface ErrorDisplayProps {
  error: AppError
  onRetry?: () => void
  showUserFriendlyMessage?: boolean
}

export function ErrorDisplay({
  error,
  onRetry,
  showUserFriendlyMessage = false,
}: ErrorDisplayProps) {
  const getErrorTypeDisplay = (type: AppError['type']) => {
    switch (type) {
      case 'STORAGE_ERROR':
        return 'Storage Error'
      case 'VALIDATION_ERROR':
        return 'Validation Error'
      case 'NETWORK_ERROR':
        return 'Network Error'
      case 'UNKNOWN_ERROR':
      default:
        return 'Unknown Error'
    }
  }

  const displayMessage = showUserFriendlyMessage
    ? getErrorDisplayMessage(error)
    : error.message

  const shouldShowRetry =
    onRetry && (isRecoverableError(error) || onRetry !== undefined)

  return (
    <div className="error-display" role="alert">
      <h3>{getErrorTypeDisplay(error.type)}</h3>
      <p>{displayMessage}</p>
      {shouldShowRetry && (
        <button onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  )
}
