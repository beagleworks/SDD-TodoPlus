import React, { Component, type ReactNode } from 'react'
import type { AppError } from '../../types'
import { createAppError, handleGlobalError } from '../../utils/errorHandler'
import { ErrorDisplay } from '../ErrorDisplay'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = createAppError(error)
    return {
      hasError: true,
      error: appError,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error globally
    handleGlobalError(error)

    // In a real app, you might want to send error info to a logging service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorDisplay error={this.state.error} onRetry={this.handleRetry} />
      )
    }

    return this.props.children
  }
}
