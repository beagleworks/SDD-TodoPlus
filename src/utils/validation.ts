import { z } from 'zod';
import { Todo, TodoState } from '../types/todo';

// Zod schemas for validation
export const TodoSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  status: z.enum(['not_started', 'in_progress', 'completed'], {
    errorMap: () => ({ message: 'Status must be one of: not_started, in_progress, completed' })
  }),
  completionComment: z.string().max(500, 'Completion comment must be 500 characters or less').optional(),
  createdAt: z.date({
    errorMap: () => ({ message: 'Created date must be a valid Date object' })
  }),
  updatedAt: z.date({
    errorMap: () => ({ message: 'Updated date must be a valid Date object' })
  }),
  order: z.number().min(0, 'Order must be non-negative')
});

export const TodoStateSchema = z.object({
  todos: z.array(TodoSchema),
  filter: z.enum(['all', 'not_started', 'in_progress', 'completed'], {
    errorMap: () => ({ message: 'Filter must be one of: all, not_started, in_progress, completed' })
  })
});

export const LocalStorageDataSchema = z.object({
  todos: z.array(TodoSchema),
  version: z.string().min(1, 'Version is required')
});

// Validation functions with better error handling
export function validateTodo(data: unknown): Todo {
  try {
    return TodoSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Todo validation failed: ${errorMessage}`);
    }
    throw error;
  }
}

export function validateTodoState(data: unknown): TodoState {
  try {
    return TodoStateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`TodoState validation failed: ${errorMessage}`);
    }
    throw error;
  }
}

export function validateLocalStorageData(data: unknown): { todos: Todo[]; version: string } {
  try {
    return LocalStorageDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`LocalStorage data validation failed: ${errorMessage}`);
    }
    throw error;
  }
}

// Additional utility functions for validation
export function isValidTodoStatus(status: string): status is Todo['status'] {
  return ['not_started', 'in_progress', 'completed'].includes(status);
}

export function isValidFilterType(filter: string): filter is TodoState['filter'] {
  return ['all', 'not_started', 'in_progress', 'completed'].includes(filter);
}