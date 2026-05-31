"use client";

import React from "react";
import { ArrowClockwise, Warning } from "@phosphor-icons/react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
          <div className="rounded-full bg-red-50 p-4">
            <Warning size={32} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--forest)]">
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--muted)] max-w-md">
            An unexpected error occurred. Try refreshing, or go back to the dashboard.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--forest)] text-white hover:opacity-90 transition-opacity"
            >
              <ArrowClockwise size={16} />
              Try again
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--forest)] hover:bg-[var(--surface-alt)] transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
