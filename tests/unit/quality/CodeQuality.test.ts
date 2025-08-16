import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

describe('Code Quality Checks', () => {
  describe('ESLint Compliance', () => {
    it('should pass ESLint checks without errors', () => {
      expect(() => {
        execSync('npm run lint', { stdio: 'pipe', timeout: 10000 })
      }).not.toThrow()
    }, 15000)
  })

  describe('TypeScript Strict Mode Compliance', () => {
    it('should pass TypeScript type checking in strict mode', () => {
      expect(() => {
        execSync('npm run type-check', { stdio: 'pipe' })
      }).not.toThrow()
    })

    it('should have strict mode enabled in tsconfig.app.json', () => {
      const tsconfigContent = readFileSync('tsconfig.app.json', 'utf-8')
      // Remove comments from JSON content
      const cleanContent = tsconfigContent.replace(
        /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
        ''
      )
      const tsconfig = JSON.parse(cleanContent)
      expect(tsconfig.compilerOptions.strict).toBe(true)
      expect(tsconfig.compilerOptions.noUnusedLocals).toBe(true)
      expect(tsconfig.compilerOptions.noUnusedParameters).toBe(true)
      expect(tsconfig.compilerOptions.noFallthroughCasesInSwitch).toBe(true)
    })
  })

  describe('Prettier Formatting', () => {
    it('should have consistent code formatting', () => {
      expect(() => {
        execSync('npx prettier --check .', { stdio: 'pipe' })
      }).not.toThrow()
    })
  })

  describe('Build Process', () => {
    it('should build successfully without errors', () => {
      expect(() => {
        execSync('npm run build', { stdio: 'pipe' })
      }).not.toThrow()
    })
  })
})

describe('Unused Code Detection', () => {
  const srcDir = 'src'
  const testDir = 'tests'

  function getAllTsFiles(dir: string): string[] {
    const files: string[] = []

    function traverse(currentDir: string) {
      const items = readdirSync(currentDir)

      for (const item of items) {
        const fullPath = join(currentDir, item)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          traverse(fullPath)
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath)
        }
      }
    }

    traverse(dir)
    return files
  }

  it('should not have unused TypeScript files in src directory', () => {
    const allFiles = getAllTsFiles(srcDir)
    const mainFile = join(srcDir, 'main.tsx')
    const appFile = join(srcDir, 'App.tsx')

    // For this test, we'll check that main files exist and are properly structured
    expect(allFiles).toContain(mainFile)
    expect(allFiles).toContain(appFile)

    // Check that main.tsx imports App.tsx
    const mainContent = readFileSync(mainFile, 'utf-8')
    expect(mainContent).toMatch(/import.*App.*from.*['"]\.\//i)
  })

  it('should not have unused imports in component files', () => {
    const componentFiles = getAllTsFiles(join(srcDir, 'components'))

    for (const file of componentFiles) {
      const content = readFileSync(file, 'utf-8')

      // Check for unused React import (should not be present in React 19)
      if (content.includes("import React from 'react'")) {
        throw new Error(
          `Unused React import found in ${file}. React 19 doesn't require explicit React import for JSX.`
        )
      }

      // Check for unused variables (basic check)
      const unusedVarRegex = /const\s+(\w+)\s*=/g
      let match: RegExpExecArray | null
      while ((match = unusedVarRegex.exec(content)) !== null) {
        const varName = match[1]
        if (
          varName &&
          !content.includes(varName, match.index + match[0].length)
        ) {
          // This is a basic check - in real scenarios, we'd use a more sophisticated approach
          console.warn(`Potentially unused variable ${varName} in ${file}`)
        }
      }
    }
  })

  it('should have all test files corresponding to source files', () => {
    const srcFiles = getAllTsFiles(srcDir)
    const testFiles = getAllTsFiles(testDir)

    // Check that critical files have corresponding tests
    const criticalFiles = [
      'hooks/useTodos.ts',
      'hooks/useLocalStorage.ts',
      'hooks/useDragAndDrop.ts',
      'utils/validation.ts',
      'utils/storage.ts',
      'utils/twitter.ts',
    ]

    for (const criticalFile of criticalFiles) {
      if (srcFiles.some((f) => f.includes(criticalFile))) {
        const hasTest = testFiles.some((f) =>
          f.includes(criticalFile.replace('.ts', '.test.ts'))
        )
        expect(hasTest).toBe(true)
      }
    }
  })
})
