import { describe, it, expect } from 'vitest'
import { validateTodo } from '../../../src/utils/validation'
import type { Todo } from '../../../src/types/todo'

describe('validation utils', () => {
  describe('validateTodo', () => {
    it('should validate a valid todo', () => {
      const validTodo: Todo = {
        id: '123',
        title: 'Test Todo',
        status: 'not_started',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      expect(() => validateTodo(validTodo)).not.toThrow()
    })

    it('should throw error for invalid todo', () => {
      const invalidTodo = {
        id: '',
        title: '',
        status: 'invalid_status',
      }

      expect(() => validateTodo(invalidTodo as Todo)).toThrow()
    })
  })

  describe('validateTodo with partial data', () => {
    it('should validate a complete todo object', () => {
      const validTodo: Todo = {
        id: '123',
        title: 'Updated Title',
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      expect(() => validateTodo(validTodo)).not.toThrow()
    })

    it('should throw error for invalid status', () => {
      const invalidTodo = {
        id: '123',
        title: 'Test',
        status: 'invalid_status',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
      }

      expect(() => validateTodo(invalidTodo as Todo)).toThrow()
    })
  })
})
