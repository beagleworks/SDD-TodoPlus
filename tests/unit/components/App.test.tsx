import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../../../src/App'

describe('App', () => {
  it('renders todo app header', () => {
    render(<App />)
    expect(screen.getByText('Todo App')).toBeInTheDocument()
  })

  it('renders todo input', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Add new todo...')).toBeInTheDocument()
  })

  it('renders add todo button', () => {
    render(<App />)
    expect(screen.getByText('Add Todo')).toBeInTheDocument()
  })
})
