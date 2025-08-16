import { describe, it, expect } from 'vitest';
import { Todo, TodoState, TodoAction } from '../../../src/types/todo';
import { 
  validateTodo, 
  validateTodoState, 
  validateLocalStorageData,
  isValidTodoStatus,
  isValidFilterType
} from '../../../src/utils/validation';

describe('Todo Type Validation', () => {
  describe('Todo validation', () => {
    it('should fail validation for invalid Todo object', () => {
      const invalidTodo = {
        id: '', // empty id should fail
        title: '', // empty title should fail
        status: 'invalid_status', // invalid status should fail
        createdAt: 'not-a-date', // invalid date should fail
        updatedAt: 'not-a-date', // invalid date should fail
        order: -1 // negative order should fail
      };

      expect(() => validateTodo(invalidTodo)).toThrow();
    });

    it('should fail validation for Todo with missing required fields', () => {
      const incompleteTodo = {
        title: 'Test Todo'
        // missing id, status, dates, order
      };

      expect(() => validateTodo(incompleteTodo)).toThrow();
    });

    it('should fail validation for Todo with title exceeding 200 characters', () => {
      const longTitle = 'a'.repeat(201);
      const todoWithLongTitle = {
        id: 'test-id',
        title: longTitle,
        status: 'not_started',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0
      };

      expect(() => validateTodo(todoWithLongTitle)).toThrow();
    });

    it('should fail validation for Todo with completion comment exceeding 500 characters', () => {
      const longComment = 'a'.repeat(501);
      const todoWithLongComment = {
        id: 'test-id',
        title: 'Test Todo',
        status: 'completed',
        completionComment: longComment,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0
      };

      expect(() => validateTodo(todoWithLongComment)).toThrow();
    });
  });

  describe('TodoAction type safety', () => {
    it('should fail type checking for invalid TodoAction', () => {
      // This test checks TypeScript compilation, not runtime behavior
      // We'll use a function that expects TodoAction to test type safety
      const processAction = (action: TodoAction): string => {
        switch (action.type) {
          case 'ADD_TODO':
            return `Adding todo: ${action.payload.title}`;
          case 'UPDATE_TODO':
            return `Updating todo: ${action.payload.id}`;
          case 'DELETE_TODO':
            return `Deleting todo: ${action.payload.id}`;
          case 'REORDER_TODOS':
            return `Reordering ${action.payload.todos.length} todos`;
          case 'SET_FILTER':
            return `Setting filter: ${action.payload.filter}`;
          case 'LOAD_TODOS':
            return `Loading ${action.payload.todos.length} todos`;
          default:
            // @ts-expect-error - This should cause a TypeScript error for invalid action types
            return `Unknown action: ${action.type}`;
        }
      };

      // Valid actions should work
      expect(processAction({ type: 'ADD_TODO', payload: { title: 'Test' } })).toBe('Adding todo: Test');
      expect(processAction({ type: 'DELETE_TODO', payload: { id: 'test-id' } })).toBe('Deleting todo: test-id');
      expect(processAction({ type: 'SET_FILTER', payload: { filter: 'completed' } })).toBe('Setting filter: completed');
    });

    it('should ensure TodoAction payload type safety', () => {
      const validateActionPayload = (action: TodoAction): boolean => {
        switch (action.type) {
          case 'ADD_TODO':
            return typeof action.payload.title === 'string' && action.payload.title.length > 0;
          case 'UPDATE_TODO':
            return typeof action.payload.id === 'string' && typeof action.payload.updates === 'object';
          case 'DELETE_TODO':
            return typeof action.payload.id === 'string';
          case 'REORDER_TODOS':
            return Array.isArray(action.payload.todos);
          case 'SET_FILTER':
            return ['all', 'not_started', 'in_progress', 'completed'].includes(action.payload.filter);
          case 'LOAD_TODOS':
            return Array.isArray(action.payload.todos);
          default:
            return false;
        }
      };

      // Test valid payloads
      expect(validateActionPayload({ type: 'ADD_TODO', payload: { title: 'Test Todo' } })).toBe(true);
      expect(validateActionPayload({ type: 'UPDATE_TODO', payload: { id: 'test-id', updates: { title: 'Updated' } } })).toBe(true);
      expect(validateActionPayload({ type: 'DELETE_TODO', payload: { id: 'test-id' } })).toBe(true);
      expect(validateActionPayload({ type: 'REORDER_TODOS', payload: { todos: [] } })).toBe(true);
      expect(validateActionPayload({ type: 'SET_FILTER', payload: { filter: 'completed' } })).toBe(true);
      expect(validateActionPayload({ type: 'LOAD_TODOS', payload: { todos: [] } })).toBe(true);
    });
  });

  describe('LocalStorage Schema validation', () => {
    it('should fail validation for invalid LocalStorage data structure', () => {
      const invalidData = {
        todos: 'not-an-array', // should be array
        version: 123 // should be string
      };

      expect(() => validateLocalStorageData(invalidData)).toThrow();
    });

    it('should fail validation for LocalStorage data with invalid todos', () => {
      const invalidTodosData = {
        todos: [
          {
            id: '', // invalid empty id
            title: 'Test',
            status: 'invalid_status', // invalid status
            createdAt: 'not-a-date', // invalid date
            updatedAt: 'not-a-date', // invalid date
            order: -1 // invalid negative order
          }
        ],
        version: '1.0.0'
      };

      expect(() => validateLocalStorageData(invalidTodosData)).toThrow();
    });

    it('should fail validation for LocalStorage data missing required fields', () => {
      const incompleteData = {
        todos: []
        // missing version
      };

      expect(() => validateLocalStorageData(incompleteData)).toThrow();
    });

    it('should pass validation for valid LocalStorage data', () => {
      const validData = {
        todos: [
          {
            id: 'test-id',
            title: 'Test Todo',
            status: 'not_started' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0
          }
        ],
        version: '1.0.0'
      };

      expect(() => validateLocalStorageData(validData)).not.toThrow();
      const result = validateLocalStorageData(validData);
      expect(result.todos).toHaveLength(1);
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('Utility validation functions', () => {
    describe('isValidTodoStatus', () => {
      it('should return true for valid todo statuses', () => {
        expect(isValidTodoStatus('not_started')).toBe(true);
        expect(isValidTodoStatus('in_progress')).toBe(true);
        expect(isValidTodoStatus('completed')).toBe(true);
      });

      it('should return false for invalid todo statuses', () => {
        expect(isValidTodoStatus('invalid')).toBe(false);
        expect(isValidTodoStatus('')).toBe(false);
        expect(isValidTodoStatus('COMPLETED')).toBe(false);
      });
    });

    describe('isValidFilterType', () => {
      it('should return true for valid filter types', () => {
        expect(isValidFilterType('all')).toBe(true);
        expect(isValidFilterType('not_started')).toBe(true);
        expect(isValidFilterType('in_progress')).toBe(true);
        expect(isValidFilterType('completed')).toBe(true);
      });

      it('should return false for invalid filter types', () => {
        expect(isValidFilterType('invalid')).toBe(false);
        expect(isValidFilterType('')).toBe(false);
        expect(isValidFilterType('ALL')).toBe(false);
      });
    });
  });

  describe('TodoState validation', () => {
    it('should fail validation for invalid TodoState', () => {
      const invalidState = {
        todos: 'not-an-array',
        filter: 'invalid_filter'
      };

      expect(() => validateTodoState(invalidState)).toThrow();
    });

    it('should pass validation for valid TodoState', () => {
      const validState = {
        todos: [],
        filter: 'all' as const
      };

      expect(() => validateTodoState(validState)).not.toThrow();
      const result = validateTodoState(validState);
      expect(result.todos).toEqual([]);
      expect(result.filter).toBe('all');
    });
  });
});