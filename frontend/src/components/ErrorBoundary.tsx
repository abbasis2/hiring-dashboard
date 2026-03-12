import type { PropsWithChildren } from "react";
import { Component } from "react";

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<PropsWithChildren, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-6 text-center">
          <div className="card-shell max-w-md">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Refresh the page or try the action again.
            </p>
            <button
              className="mt-6 rounded-lg bg-[var(--accent-primary)] px-4 py-2 font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--accent-primary-strong)]"
              onClick={() => this.setState({ hasError: false })}
              type="button"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
