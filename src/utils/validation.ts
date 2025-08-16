import { z } from 'zod'

export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  completionComment: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  order: z.number(),
})

export const TodoStateSchema = z.object({
  todos: z.array(TodoSchema),
  filter: z.enum(['all', 'not_started', 'in_progress', 'completed']),
})

export const LocalStorageSchema = z.object({
  'todo-app-data': z.object({
    todos: z.array(TodoSchema),
    version: z.string(),
  }),
  'todo-app-preferences': z.object({
    filter: z.enum(['all', 'not_started', 'in_progress', 'completed']),
    theme: z.enum(['light', 'dark']).optional(),
  }),
})

export const validateTodo = (data: unknown) => {
  return TodoSchema.safeParse(data)
}

export const validateTodoState = (data: unknown) => {
  return TodoStateSchema.safeParse(data)
}
