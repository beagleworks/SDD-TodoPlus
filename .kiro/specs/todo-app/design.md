# Design Document

## Overview

TypeScript + React 19を使用したTodoアプリケーションの設計書です。このアプリは関数型コンポーネントとReact Hooksを中心とした設計で、ローカルストレージによるデータ永続化、ドラッグアンドドロップ機能、X（Twitter）投稿機能を提供します。テスト駆動開発（TDD）のアプローチを採用し、クラスの使用を最小限に抑えた実装を行います。

## Architecture

### Component Architecture

```
App
├── TodoHeader
├── TodoInput
├── TodoList
│   └── TodoItem (draggable)
│       ├── TodoStatus
│       ├── TodoActions
│       └── CompletionCommentModal
└── ErrorBoundary
```

### Data Flow

- 単方向データフロー（React標準）
- Context APIを使用したグローバル状態管理
- カスタムHooksによるビジネスロジックの分離
- ローカルストレージとの同期

### State Management Strategy

- `useReducer`を使用したTodo状態管理
- カスタムHook `useTodos`でビジネスロジックをカプセル化
- `useLocalStorage`カスタムHookでデータ永続化
- `useDragAndDrop`カスタムHookでドラッグアンドドロップ機能

## Components and Interfaces

### Core Types

```typescript
interface Todo {
  id: string
  title: string
  status: 'not_started' | 'in_progress' | 'completed'
  completionComment?: string
  createdAt: Date
  updatedAt: Date
  order: number
}

interface TodoState {
  todos: Todo[]
  filter: 'all' | 'not_started' | 'in_progress' | 'completed'
}

type TodoAction =
  | { type: 'ADD_TODO'; payload: { title: string } }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: Partial<Todo> } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'REORDER_TODOS'; payload: { todos: Todo[] } }
  | { type: 'SET_FILTER'; payload: { filter: TodoState['filter'] } }
  | { type: 'LOAD_TODOS'; payload: { todos: Todo[] } }
```

### Component Interfaces

#### TodoInput Component

```typescript
interface TodoInputProps {
  onAddTodo: (title: string) => void
}
```

#### TodoItem Component

```typescript
interface TodoItemProps {
  todo: Todo
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void
  onDeleteTodo: (id: string) => void
  onPostToX: (todo: Todo) => void
  isDragging: boolean
  dragHandleProps: any
}
```

#### CompletionCommentModal Component

```typescript
interface CompletionCommentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (comment: string) => void
  initialComment?: string
}
```

### Custom Hooks

#### useTodos Hook

```typescript
interface UseTodosReturn {
  state: TodoState
  actions: {
    addTodo: (title: string) => void
    updateTodo: (id: string, updates: Partial<Todo>) => void
    deleteTodo: (id: string) => void
    reorderTodos: (todos: Todo[]) => void
    setFilter: (filter: TodoState['filter']) => void
  }
}
```

#### useLocalStorage Hook

```typescript
interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T) => void
  removeValue: () => void
  error: string | null
}
```

#### useDragAndDrop Hook

```typescript
interface UseDragAndDropReturn {
  draggedItem: Todo | null
  dragOverItem: Todo | null
  handleDragStart: (todo: Todo) => void
  handleDragOver: (e: DragEvent, todo: Todo) => void
  handleDrop: (e: DragEvent) => void
  handleDragEnd: () => void
}
```

## Data Models

### Todo Model

- **id**: 一意識別子（UUID v4を使用）
- **title**: タスク名（必須、最大200文字）
- **status**: 進捗状態（not_started | in_progress | completed）
- **completionComment**: 完了時コメント（オプション、最大500文字）
- **createdAt**: 作成日時
- **updatedAt**: 更新日時
- **order**: 表示順序（数値）

### LocalStorage Schema

```typescript
interface LocalStorageSchema {
  'todo-app-data': {
    todos: Todo[]
    version: string // データスキーマバージョン
  }
  'todo-app-preferences': {
    filter: TodoState['filter']
    theme?: 'light' | 'dark'
  }
}
```

### Data Validation

- Zodライブラリを使用したランタイム型検証
- ローカルストレージからのデータ読み込み時の検証
- フォーム入力値の検証

## Error Handling

### Error Types

```typescript
interface AppError {
  type: 'STORAGE_ERROR' | 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR'
  message: string
  details?: any
}
```

### Error Handling Strategy

1. **Storage Errors**: ローカルストレージアクセス失敗時の代替処理
2. **Validation Errors**: 入力値検証エラーのユーザーフレンドリーな表示
3. **Network Errors**: X投稿機能でのネットワークエラー処理
4. **Graceful Degradation**: 機能が利用できない場合の代替UI

### Error Boundary Implementation

- React Error Boundaryによるコンポーネントレベルのエラーキャッチ
- エラー情報のローカルログ保存
- ユーザーへの適切なエラーメッセージ表示

## Testing Strategy

### Testing Strategy (t-wada氏推奨のテスト戦略)

1. **Unit Tests (70%)**
   - 小さく、高速で、独立したテスト
   - カスタムHooksのテスト（ビジネスロジック）
   - ユーティリティ関数のテスト（純粋関数）
   - データ変換ロジックのテスト
   - **テストファースト**: 実装前にテストを書く

2. **Integration Tests (20%)**
   - コンポーネント間の連携テスト
   - ローカルストレージとの統合テスト
   - ドラッグアンドドロップ機能のテスト
   - **実装詳細ではなく振る舞いをテスト**

3. **E2E Tests (10%)**
   - ユーザーフローの完全なテスト
   - ブラウザ間の互換性テスト
   - **ハッピーパスを中心に最小限で効果的に**

### テスト品質の原則

- **テストコードも本番コード**: 可読性、保守性を重視
- **テストの独立性**: テスト間の依存関係を排除
- **意図の明確化**: テストが何を検証しているかを明確に
- **失敗時の診断性**: テストが失敗した時に原因が分かりやすい

### Testing Tools (t-wada氏推奨に基づく選択)

- **Jest**: テストランナー
- **React Testing Library**: コンポーネントテスト（実装詳細ではなく振る舞いをテスト）
- **MSW (Mock Service Worker)**: APIモック
- **@testing-library/user-event**: ユーザーインタラクションテスト
- **@testing-library/jest-dom**: より表現力豊かなアサーション
- **テストの可読性**: テストコードも本番コードと同等の品質を保つ
- **テストの保守性**: テストが壊れにくく、意図が明確になるよう設計

### TDD Implementation Process (t-wada氏推奨アプローチ)

1. **Red**: 失敗するテストを書く
   - 仕様を明確にするテストを先に書く
   - テストが失敗することを確認する
   - テストコードの品質にもこだわる
2. **Green**: テストを通す最小限のコードを書く
   - 「動くきたないコード」から始める
   - テストを通すことだけに集中する
   - 過度な実装は避ける
3. **Refactor**: コードを改善する
   - テストが通った状態でリファクタリング
   - 重複の除去、意図の明確化
   - テストコードもリファクタリング対象
4. **各タスクでこのサイクルを繰り返す**
   - 小さな単位でのTDDサイクル
   - テストファーストの徹底
   - テスト自体の品質向上も重視

### Test Coverage Requirements (t-wada氏の考え方に基づく)

- **カバレッジは品質の指標ではなく、テストの抜け漏れを発見するツール**
- 関数・メソッドカバレッジ: 90%以上（目安）
- 分岐カバレッジ: 85%以上（目安）
- 行カバレッジ: 90%以上（目安）
- **重要**: カバレッジよりもテストの質を重視
- **テストの価値**: バグを見つける、仕様を明確にする、リファクタリングを安全にする
- **テストコードの品質**: 可読性、保守性、実行速度を重視

## Implementation Details

### Drag and Drop Implementation

- HTML5 Drag and Drop APIを使用
- タッチデバイス対応のためのpolyfill
- アクセシビリティ対応（キーボード操作）
- 視覚的フィードバックの提供

### X (Twitter) Integration

- Web Intents APIを使用
- 新しいウィンドウでX投稿画面を開く
- 文字数制限の考慮（280文字）
- URLエンコーディングの適切な処理

### Performance Optimizations

- `React.memo`による不要な再レンダリング防止
- `useCallback`と`useMemo`による最適化
- 仮想化（大量のTodoアイテム対応）
- 遅延ローディング（必要に応じて）

### Accessibility Features

- ARIA属性の適切な使用
- キーボードナビゲーション対応
- スクリーンリーダー対応
- 色覚異常者への配慮（色以外の視覚的手がかり）

### Browser Compatibility

- モダンブラウザ対応（Chrome, Firefox, Safari, Edge）
- ES2020+ 機能の使用
- ポリフィルの最小限使用
- Progressive Enhancement

## Security Considerations

### Data Security

- XSS攻撃対策（React標準のエスケープ処理）
- ローカルストレージデータの適切な検証
- 機密情報の非保存

### Input Validation

- クライアントサイドでの入力値検証
- HTMLエスケープ処理
- 最大文字数制限の実装

## Development Workflow

### Git Workflow

- 各タスク完了時にコミット
- コミットメッセージ形式: `[task title]`
- 変更・追加ファイルのみをステージング

### Code Quality

- ESLint + Prettierによるコード品質管理
- TypeScript strict modeの使用
- Huskyによるpre-commitフック

### Build and Deployment

- Vite使用による高速ビルド
- 本番ビルドの最適化
- 静的ファイルホスティング対応
