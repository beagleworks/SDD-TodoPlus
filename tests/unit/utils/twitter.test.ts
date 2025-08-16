import {
  generateTweetText,
  getStatusText,
  postToTwitter,
} from '../../../src/utils/twitter'
import type { Todo } from '../../../src/types'
import { vi } from 'vitest'

// Mock window.open for testing
const mockWindowOpen = vi.fn()
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
})

describe('Twitter Utils', () => {
  beforeEach(() => {
    mockWindowOpen.mockClear()
  })

  describe('generateTweetText', () => {
    it('should generate correct tweet text for basic todo', () => {
      const todo: Todo = {
        id: '1',
        title: 'Test Task',
        status: 'not_started',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      const result = generateTweetText(todo)

      expect(result).toBe('タスク: Test Task - ステータス: 未実行')
    })

    it('should generate correct tweet text with completion comment', () => {
      const todo: Todo = {
        id: '1',
        title: 'Test Task',
        status: 'completed',
        completionComment: 'Task completed successfully',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      const result = generateTweetText(todo)

      expect(result).toBe(
        'タスク: Test Task - ステータス: 完了\nTask completed successfully'
      )
    })

    it('should truncate tweet text when it exceeds 280 characters', () => {
      const longComment = 'A'.repeat(300)
      const todo: Todo = {
        id: '1',
        title: 'Test Task',
        status: 'completed',
        completionComment: longComment,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      const result = generateTweetText(todo)

      // Should return base text without comment when total exceeds 280 chars
      expect(result).toBe('タスク: Test Task - ステータス: 完了')
      expect(result.length).toBeLessThanOrEqual(280)
    })

    it('should not include completion comment for non-completed tasks', () => {
      const todo: Todo = {
        id: '1',
        title: 'Test Task',
        status: 'in_progress',
        completionComment: 'This should not appear',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      const result = generateTweetText(todo)

      expect(result).toBe('タスク: Test Task - ステータス: 実行中')
      expect(result).not.toContain('This should not appear')
    })
  })

  describe('getStatusText', () => {
    it('should return correct Japanese status text', () => {
      expect(getStatusText('not_started')).toBe('未実行')
      expect(getStatusText('in_progress')).toBe('実行中')
      expect(getStatusText('completed')).toBe('完了')
    })

    it('should return the original status for unknown status', () => {
      // @ts-expect-error Testing unknown status
      expect(getStatusText('unknown')).toBe('unknown')
    })
  })

  describe('postToTwitter', () => {
    it('should generate correct Twitter URL and open window', () => {
      const todo: Todo = {
        id: '1',
        title: 'Test Task',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      postToTwitter(todo)

      const expectedText = 'タスク: Test Task - ステータス: 完了'
      const expectedUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(expectedText)}`

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expectedUrl,
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('should handle window.open errors gracefully', () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Window blocked')
      })

      const todo: Todo = {
        id: '1',
        title: 'Test Task',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      expect(() => postToTwitter(todo)).toThrow('X (Twitter) is not available')
    })
  })

  describe('Character limit and format processing', () => {
    it('should handle very long task titles correctly by truncating', () => {
      const longTitle = 'A'.repeat(300)
      const todo: Todo = {
        id: '1',
        title: longTitle,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      const result = generateTweetText(todo)

      expect(result.length).toBeLessThanOrEqual(280)
      expect(result).toContain('...')
      expect(result).toContain('ステータス: 完了')
    })

    it('should handle special characters in task titles', () => {
      const specialTitle = 'Task with #hashtag @mention & special chars 🎉'
      const todo: Todo = {
        id: '1',
        title: specialTitle,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      const result = generateTweetText(todo)

      expect(result).toBe(
        'タスク: Task with #hashtag @mention & special chars 🎉 - ステータス: 完了'
      )
      expect(result).toContain('#hashtag')
      expect(result).toContain('@mention')
      expect(result).toContain('🎉')
    })

    it('should handle empty task titles by providing default text', () => {
      const todo: Todo = {
        id: '1',
        title: '',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      const result = generateTweetText(todo)

      expect(result).toBe('タスク: (無題) - ステータス: 完了')
    })

    it('should handle whitespace-only task titles', () => {
      const todo: Todo = {
        id: '1',
        title: '   ',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      const result = generateTweetText(todo)

      expect(result).toBe('タスク: (無題) - ステータス: 完了')
    })
  })

  describe('Error handling', () => {
    it('should handle null window.open (popup blocked)', () => {
      mockWindowOpen.mockReturnValue(null)

      const todo: Todo = {
        id: '1',
        title: 'Test Task',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      expect(() => postToTwitter(todo)).toThrow('X (Twitter) is not available')
    })

    it('should handle undefined window (SSR environment)', () => {
      const originalWindow = global.window
      // @ts-expect-error Testing undefined window
      delete global.window

      const todo: Todo = {
        id: '1',
        title: 'Test Task',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      expect(() => postToTwitter(todo)).toThrow('X (Twitter) is not available')

      global.window = originalWindow
    })
  })
})
