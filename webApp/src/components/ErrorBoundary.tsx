// ============================================================================
// 汎用エラー境界。子ツリーが throw してもアプリ全体が白くならないよう、
// 子だけをフォールバック UI に差し替える。
// ============================================================================

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  /** フォールバック UI。関数形式ならエラー情報を受け取って JSX を返す */
  fallback?: ReactNode | ((err: Error, info: ErrorInfo | null) => ReactNode);
  /** ラベル（デバッグログ識別用） */
  label?: string;
  /** リセット用キー。変わると子ツリーを再マウントしエラー状態を解除 */
  resetKey?: unknown;
}

interface State {
  error: Error | null;
  /** componentDidCatch で受け取る部品の位置（どの部品で起きたか） */
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const label = this.props.label ? `[${this.props.label}] ` : '';
    console.error(`${label}ErrorBoundary caught`, error, info);
    this.setState({ info });
  }

  componentDidUpdate(prevProps: Props): void {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null, info: null });
    }
  }

  render(): ReactNode {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(this.state.error, this.state.info);
      if (fallback !== undefined) return fallback;
      return (
        <div style={{ padding: 16, color: '#c00', fontFamily: 'sans-serif', fontSize: 14 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 6 }}>エラーが発生しました</div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{String(this.state.error?.message ?? this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
