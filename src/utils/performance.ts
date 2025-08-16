/**
 * Performance utilities for React components
 */

import { memo } from 'react'
import type { ComponentType } from 'react'

/**
 * Creates a memoized component with a custom comparison function
 * @param Component - The component to memoize
 * @param areEqual - Custom comparison function
 * @returns Memoized component
 */
export function createMemoizedComponent<T>(
  Component: ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return memo(Component, areEqual)
}

/**
 * Default shallow comparison for props
 * @param prevProps - Previous props
 * @param nextProps - Next props
 * @returns True if props are equal
 */
export function shallowEqual<T extends Record<string, unknown>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps)
  const nextKeys = Object.keys(nextProps)

  if (prevKeys.length !== nextKeys.length) {
    return false
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false
    }
  }

  return true
}

/**
 * Performance measurement utility
 * @param name - Name of the operation
 * @param fn - Function to measure
 * @returns Result of the function
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  const startTime = performance.now()
  const result = fn()
  const endTime = performance.now()

  if (
    typeof window !== 'undefined' &&
    (window as { __DEV__?: boolean }).__DEV__
  ) {
    console.log(`[Performance] ${name}: ${endTime - startTime}ms`)
  }

  return result
}

/**
 * Debounce function for performance optimization
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle function for performance optimization
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      window.setTimeout(() => (inThrottle = false), limit)
    }
  }
}
