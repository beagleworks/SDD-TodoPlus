# Implementation Plan (t-wada氏推奨TDDアプローチ)

- [x] 1. プロジェクトセットアップと基本構造の作成
  - Vite + React 19 + TypeScriptプロジェクトの初期化
  - 必要な依存関係のインストール（zod, uuid, @types/uuid, @testing-library/jest-dom等）
  - ESLint、Prettier、テスト環境の設定
  - 基本的なディレクトリ構造とファイルの作成
  - _Requirements: 7.1, 7.2, 7.3, 8.3_

- [x] 2. 型定義とデータモデルのテストファースト実装
  - **Red**: Todo型のバリデーション失敗テストを書く
  - **Green**: Todo型とTodoState型の定義
  - **Red**: TodoAction型の型安全性テストを書く
  - **Green**: TodoAction型の定義
  - **Red**: LocalStorageSchemaのバリデーションテストを書く
  - **Green**: Zodスキーマによるバリデーション関数の実装
  - **Refactor**: 型定義とテストコードの整理
  - _Requirements: 7.1, 6.5_

- [-] 3. ローカルストレージ管理機能のTDD実装
  - **Red**: useLocalStorageフックが存在しないデータを読み込む失敗テストを書く
  - **Green**: useLocalStorageカスタムHookの基本実装
  - **Red**: データ保存失敗時のエラーハンドリングテストを書く
  - **Green**: エラーハンドリング機能付きのストレージアクセス実装
  - **Red**: データ削除機能のテストを書く
  - **Green**: データの読み込み・保存・削除機能の実装
  - **Refactor**: useLocalStorageフックとテストコードの整理
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4. Todo状態管理のTDD実装
  - **Red**: TodoReducerが存在しないアクションを処理する失敗テストを書く
  - **Green**: TodoReducerの基本実装
  - **Red**: useTodosフックのTodo作成機能テストを書く
  - **Green**: useTodosカスタムHookのTodo作成機能実装
  - **Red**: Todo更新・削除・並び替えロジックのテストを書く
  - **Green**: Todo更新・削除・並び替えロジックの実装
  - **Refactor**: 状態管理ロジックとテストコードの整理
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.5_

- [ ] 5. 基本UIコンポーネントのTDD実装
- [ ] 5.1 TodoInputコンポーネントのTDD実装
  - **Red**: 空の入力でTodo追加を試行する失敗テストを書く
  - **Green**: 新しいTodoを追加するフォームの基本実装
  - **Red**: バリデーション機能のテストを書く（文字数制限等）
  - **Green**: バリデーション機能の実装
  - **Refactor**: TodoInputコンポーネントとテストコードの整理
  - _Requirements: 1.1, 1.2_

- [ ] 5.2 TodoItemコンポーネントのTDD実装
  - **Red**: Todo表示機能のテストを書く（タイトル、ステータス表示）
  - **Green**: Todo表示機能の実装
  - **Red**: Todo編集機能のテストを書く
  - **Green**: Todo編集機能の実装
  - **Red**: Todo削除機能のテストを書く
  - **Green**: Todo削除機能の実装
  - **Red**: ステータス変更機能のテストを書く
  - **Green**: ステータス変更機能の実装
  - **Refactor**: TodoItemコンポーネントとテストコードの整理
  - _Requirements: 1.3, 1.4, 2.2, 2.3, 2.4_

- [ ] 5.3 TodoListコンポーネントのTDD実装
  - **Red**: 空のTodoリスト表示テストを書く
  - **Green**: TodoItemのリスト表示基本実装
  - **Red**: フィルタリング機能のテストを書く（未実行、実行中、完了）
  - **Green**: フィルタリング機能の実装
  - **Refactor**: TodoListコンポーネントとテストコードの整理
  - _Requirements: 1.1, 2.3, 2.4_

- [ ] 6. 進捗管理機能のTDD実装
- [ ] 6.1 ステータス変更機能のTDD実装
  - **Red**: 無効なステータス変更を試行する失敗テストを書く
  - **Green**: 未実行・実行中・完了の状態変更基本実装
  - **Red**: 視覚的な状態表示のテストを書く（CSS class、色分け等）
  - **Green**: 視覚的な状態表示の実装
  - **Refactor**: ステータス変更機能とテストコードの整理
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6.2 完了コメント機能のTDD実装
  - **Red**: CompletionCommentModalが表示されない失敗テストを書く
  - **Green**: CompletionCommentModalコンポーネントの基本実装
  - **Red**: 完了時のコメント入力機能テストを書く
  - **Green**: 完了時のコメント入力機能の実装
  - **Red**: コメント表示・編集機能のテストを書く
  - **Green**: コメント表示・編集機能の実装
  - **Refactor**: 完了コメント機能とテストコードの整理
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. ドラッグアンドドロップ機能のTDD実装
- [ ] 7.1 useDragAndDropカスタムHookのTDD実装
  - **Red**: ドラッグ開始時の状態管理失敗テストを書く
  - **Green**: HTML5 Drag and Drop APIの基本実装
  - **Red**: ドラッグ中の状態管理テストを書く
  - **Green**: ドラッグ状態管理の実装
  - **Red**: ドロップ時の並び替えロジックテストを書く
  - **Green**: ドロップ時の並び替えロジック実装
  - **Refactor**: useDragAndDropフックとテストコードの整理
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7.2 TodoItemにドラッグアンドドロップ機能のTDD統合
  - **Red**: ドラッグハンドルが機能しない失敗テストを書く
  - **Green**: ドラッグハンドルの追加実装
  - **Red**: 視覚的フィードバックのテストを書く（ドラッグ中の見た目変化）
  - **Green**: 視覚的フィードバックの実装
  - **Red**: アクセシビリティ対応のテストを書く（キーボード操作等）
  - **Green**: アクセシビリティ対応の実装
  - **Refactor**: ドラッグアンドドロップ統合とテストコードの整理
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 8. X（Twitter）投稿機能のTDD実装
  - **Red**: X投稿URLが正しく生成されない失敗テストを書く
  - **Green**: X投稿用のユーティリティ関数基本実装
  - **Red**: 投稿ボタンクリック時の動作テストを書く
  - **Green**: 投稿ボタンとモーダルの実装
  - **Red**: 文字数制限とフォーマット処理のテストを書く
  - **Green**: 文字数制限とフォーマット処理の実装
  - **Red**: エラーハンドリングのテストを書く（X利用不可時等）
  - **Green**: エラーハンドリングの実装
  - **Refactor**: X投稿機能とテストコードの整理
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9. エラーハンドリングとErrorBoundaryのTDD実装
  - **Red**: AppError型が存在しない失敗テストを書く
  - **Green**: AppError型の定義
  - **Red**: ErrorBoundaryがエラーをキャッチしない失敗テストを書く
  - **Green**: ErrorBoundaryコンポーネントの基本実装
  - **Red**: グローバルエラーハンドリングのテストを書く
  - **Green**: グローバルエラーハンドリングの実装
  - **Red**: エラー表示UIのテストを書く
  - **Green**: エラー表示UIの実装
  - **Refactor**: エラーハンドリングとテストコードの整理
  - _Requirements: 6.4, 6.5_

- [ ] 10. メインAppコンポーネントのTDD統合
  - **Red**: Appコンポーネントが初期データを読み込まない失敗テストを書く
  - **Green**: 全コンポーネントの統合とContext Providerの設定
  - **Red**: 初期データロード処理のテストを書く
  - **Green**: 初期データロード処理の実装
  - **Red**: コンポーネント間の連携テストを書く
  - **Green**: コンポーネント間の連携実装
  - **Refactor**: App統合とテストコードの整理
  - _Requirements: 6.3, 7.4_

- [ ] 11. アクセシビリティ機能のTDD実装
  - **Red**: ARIA属性が不足している失敗テストを書く
  - **Green**: ARIA属性の追加実装
  - **Red**: キーボードナビゲーションのテストを書く
  - **Green**: キーボードナビゲーション対応の実装
  - **Red**: スクリーンリーダー対応のテストを書く
  - **Green**: スクリーンリーダー対応の実装
  - **Refactor**: アクセシビリティ機能とテストコードの整理
  - _Requirements: 4.5_

- [ ] 12. パフォーマンス最適化のTDD実装
  - **Red**: 不要な再レンダリングが発生する失敗テストを書く
  - **Green**: React.memoによる最適化実装
  - **Red**: useCallbackとuseMemoの効果測定テストを書く
  - **Green**: useCallbackとuseMemoの適用実装
  - **Red**: パフォーマンス劣化のテストを書く
  - **Green**: 不要な再レンダリングの防止実装
  - **Refactor**: パフォーマンス最適化とテストコードの整理
  - _Requirements: 7.4_

- [ ] 13. E2EテストのTDD実装
  - **Red**: 主要ユーザーフロー（Todo作成→編集→完了）のE2E失敗テストを書く
  - **Green**: 主要ユーザーフローのE2Eテスト実装
  - **Red**: ドラッグアンドドロップのE2E失敗テストを書く
  - **Green**: ドラッグアンドドロップのE2Eテスト実装
  - **Red**: ローカルストレージ永続化のE2E失敗テストを書く
  - **Green**: ローカルストレージ永続化のE2Eテスト実装
  - **Red**: X投稿機能のE2E失敗テストを書く
  - **Green**: X投稿機能のE2Eテスト実装
  - **Refactor**: E2Eテストコードの整理と最適化
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 4.1, 5.1, 6.1, 6.2, 6.3_

- [ ] 14. 最終的な統合とTDDリファクタリング
  - **Red**: コード品質チェックの失敗テストを書く（ESLint、TypeScript等）
  - **Green**: コード品質の最終チェックとTypeScript strict modeでのエラー修正
  - **Red**: 未使用コードの検出テストを書く
  - **Green**: 未使用コードの削除実装
  - **Refactor**: 全体的なコードリファクタリングとドキュメント更新
  - **最終確認**: 全テストの実行とTDDサイクルの完了確認
  - _Requirements: 7.3, 7.5_