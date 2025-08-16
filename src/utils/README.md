# Error Handling Utilities

This module provides comprehensive error handling utilities for the Todo application.

## Core Components

### AppError Type

- Standardized error interface with type, message, and optional details
- Supports STORAGE_ERROR, VALIDATION_ERROR, NETWORK_ERROR, and UNKNOWN_ERROR types

### Error Handler Functions

- `createAppError()` - Creates AppError from generic Error
- `handleGlobalError()` - Logs errors globally
- `isRecoverableError()` - Determines if error can be retried
- `getErrorDisplayMessage()` - Provides user-friendly error messages

### Specific Error Creators

- `createStorageError()` - For localStorage/storage issues
- `createValidationError()` - For input validation failures
- `createNetworkError()` - For network/API failures

## Usage Examples

```typescript
// Create and handle a storage error
try {
  localStorage.setItem('key', 'value')
} catch (error) {
  const storageError = createStorageError('Failed to save data', error)
  handleGlobalError(error)
}

// Check if error is recoverable
if (isRecoverableError(appError)) {
  // Show retry button
}

// Get user-friendly message
const message = getErrorDisplayMessage(appError)
```

## Integration

- ErrorBoundary component catches React errors and displays them
- ErrorDisplay component shows errors with optional retry functionality
- Global error handlers catch unhandled promises and window errors
- App component sets up global error event listeners
