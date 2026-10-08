import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="layout">
          <h1>Something went wrong</h1>
          <p className="muted">Try refreshing the page. If the problem persists, contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
