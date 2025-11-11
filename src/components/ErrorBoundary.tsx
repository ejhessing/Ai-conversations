import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component to catch React errors and display fallback UI
 * Prevents entire app crashes and provides recovery mechanism
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service in production
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-md">
            <Text className="text-2xl font-bold text-red-500 mb-4 text-center">
              Oops! Something went wrong
            </Text>

            <Text className="text-gray-700 text-center mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {__DEV__ && (
              <ScrollView className="bg-gray-100 rounded-lg p-4 mb-4 max-h-40">
                <Text className="text-xs font-mono text-gray-800">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text className="text-xs font-mono text-gray-600 mt-2">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={this.resetError}
              className="bg-primary-500 rounded-full py-3 px-6 items-center mb-3"
            >
              <Text className="text-white font-semibold text-base">
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // In a real app, this would navigate to home or restart
                this.resetError();
              }}
              className="bg-gray-200 rounded-full py-3 px-6 items-center"
            >
              <Text className="text-gray-700 font-semibold text-base">
                Go to Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-friendly wrapper for error boundary
 * Usage: <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>
 */
export function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
