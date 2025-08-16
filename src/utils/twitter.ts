import type { Todo } from '../types'

export const generateTweetText = (todo: Todo): string => {
  // Handle empty titles
  const title = todo.title.trim() || '(無題)'

  // Truncate very long titles to ensure the base text fits within limits
  const maxTitleLength = 200 // Leave room for prefix, status, and potential comment
  const truncatedTitle =
    title.length > maxTitleLength
      ? `${title.substring(0, maxTitleLength)}...`
      : title

  const baseText = `タスク: ${truncatedTitle} - ステータス: ${getStatusText(todo.status)}`

  if (todo.completionComment && todo.status === 'completed') {
    const withComment = `${baseText}\n${todo.completionComment}`
    // Twitter character limit is 280
    return withComment.length <= 280 ? withComment : baseText
  }

  return baseText
}

export const getStatusText = (status: Todo['status']): string => {
  switch (status) {
    case 'not_started':
      return '未実行'
    case 'in_progress':
      return '実行中'
    case 'completed':
      return '完了'
    default:
      return status
  }
}

export const postToTwitter = (todo: Todo): void => {
  // Check if window is available (for SSR/Node environments)
  if (typeof window === 'undefined') {
    throw new Error('X (Twitter) is not available')
  }

  const text = generateTweetText(todo)
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`

  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    // Check if window.open was blocked
    if (newWindow === null) {
      throw new Error('Popup blocked')
    }
  } catch (error) {
    console.error('Failed to open Twitter:', error)
    throw new Error('X (Twitter) is not available')
  }
}
