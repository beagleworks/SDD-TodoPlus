import type { Todo } from '../types'

export const generateTweetText = (todo: Todo): string => {
  const baseText = `タスク: ${todo.title} - ステータス: ${getStatusText(todo.status)}`

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
  const text = generateTweetText(todo)
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`

  try {
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (error) {
    console.error('Failed to open Twitter:', error)
    throw new Error('X (Twitter) is not available')
  }
}
