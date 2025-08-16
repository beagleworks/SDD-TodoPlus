# Technology Stack

## Core Technologies

- **TypeScript**: Primary language with strict mode enabled
- **React 19**: UI framework using functional components and hooks
- **Vite**: Build tool and development server
- **HTML5 Drag and Drop API**: For reordering functionality
- **Local Storage**: Data persistence layer

## Key Libraries & Dependencies

- **zod**: Runtime type validation and schema validation
- **uuid**: Unique identifier generation for todos
- **@types/uuid**: TypeScript definitions for uuid

## Development Tools

- **ESLint**: Code linting and quality enforcement
- **Prettier**: Code formatting
- **Jest**: Test runner
- **React Testing Library**: Component testing (behavior-focused)
- **@testing-library/user-event**: User interaction testing
- **@testing-library/jest-dom**: Enhanced assertions
- **MSW (Mock Service Worker)**: API mocking for tests
- **Husky**: Git hooks for pre-commit quality checks

## Architecture Patterns

- **Functional Programming**: Prefer functions over classes
- **Custom Hooks**: Business logic encapsulation
- **Context API**: Global state management
- **useReducer**: Complex state management
- **Test-Driven Development (TDD)**: Red-Green-Refactor cycle

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:e2e     # Run end-to-end tests

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## Development Workflow Rules

### Git Workflow

- **Task-based commits**: For each completed task, perform `git add` (changed/added files only) followed by `git commit -m "[task title]"`
- **Atomic commits**: Each commit should represent one complete task or logical unit of work
- **Clean staging**: Only add files that were actually changed or created for the specific task

### Testing Rules

- **Test integrity**: Never modify tests to make them pass when they should fail
- **Test accuracy**: If tests are not passing or appear to be incorrect, seek guidance before making changes
- **TDD discipline**: Follow the Red-Green-Refactor cycle strictly - tests should fail first, then be made to pass with minimal code

### Code Quality Standards

- **No test tampering**: Modifying tests to avoid failures is strictly prohibited
- **Seek guidance**: When tests fail unexpectedly or seem inaccurate, ask for direction rather than making assumptions
- **Maintain test quality**: Test code should be held to the same quality standards as production code

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- Progressive enhancement approach
