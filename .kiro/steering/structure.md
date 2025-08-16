# Project Structure

## Root Directory Organization

```
/
├── src/                    # Source code
├── public/                 # Static assets
├── tests/                  # Test files
├── .kiro/                  # Kiro configuration and specs
└── dist/                   # Build output (generated)
```

## Source Code Structure

```
src/
├── components/             # React components
│   ├── TodoHeader/
│   ├── TodoInput/
│   ├── TodoList/
│   ├── TodoItem/
│   ├── TodoStatus/
│   ├── TodoActions/
│   ├── CompletionCommentModal/
│   └── ErrorBoundary/
├── hooks/                  # Custom React hooks
│   ├── useTodos.ts
│   ├── useLocalStorage.ts
│   └── useDragAndDrop.ts
├── types/                  # TypeScript type definitions
│   ├── todo.ts
│   └── errors.ts
├── utils/                  # Utility functions
│   ├── validation.ts
│   ├── storage.ts
│   └── twitter.ts
├── styles/                 # CSS/styling files
└── App.tsx                 # Main application component
```

## Component Architecture

- **Hierarchical structure**: App → TodoHeader/TodoInput/TodoList → TodoItem → TodoStatus/TodoActions
- **Single responsibility**: Each component handles one specific concern
- **Composition over inheritance**: Components compose together rather than extend
- **Props interface**: Each component has a well-defined TypeScript interface

## Test Structure

```
tests/
├── unit/                   # Unit tests (70% of test suite)
│   ├── hooks/
│   ├── utils/
│   └── components/
├── integration/            # Integration tests (20% of test suite)
│   └── components/
└── e2e/                    # End-to-end tests (10% of test suite)
    └── user-flows/
```

## File Naming Conventions

- **Components**: PascalCase directories with index.tsx (e.g., `TodoItem/index.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useTodos.ts`)
- **Types**: camelCase with descriptive names (e.g., `todo.ts`, `errors.ts`)
- **Utils**: camelCase with descriptive names (e.g., `validation.ts`)
- **Tests**: Match source file name with `.test.ts` suffix

## Import/Export Patterns

- **Named exports**: Prefer named exports over default exports
- **Barrel exports**: Use index.ts files for clean imports
- **Absolute imports**: Configure path mapping for cleaner imports
- **Type-only imports**: Use `import type` for TypeScript types

## State Management Organization

- **Global state**: Context API with useReducer for todos
- **Local state**: useState for component-specific state
- **Custom hooks**: Encapsulate complex state logic
- **State colocation**: Keep state as close to where it's used as possible
