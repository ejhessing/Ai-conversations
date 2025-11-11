import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Hook to access toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

/**
 * Toast Provider - Wrap your app with this
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // Auto-hide after duration
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

/**
 * Toast Container - Renders all active toasts
 */
function ToastContainer({
  toasts,
  onHide,
}: {
  toasts: Toast[];
  onHide: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-0 right-0 items-center pointer-events-none"
      style={{ top: insets.top + 16 }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </View>
  );
}

/**
 * Individual Toast Item with animation
 */
function ToastItem({ toast, onHide }: { toast: Toast; onHide: (id: string) => void }) {
  const [translateY] = useState(new Animated.Value(-100));
  const [opacity] = useState(new Animated.Value(0));

  React.useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Slide out animation after duration
    if (toast.duration && toast.duration > 0) {
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide(toast.id);
        });
      }, toast.duration - 300);

      return () => clearTimeout(timeout);
    }
  }, [toast.id, toast.duration, translateY, opacity, onHide]);

  const getToastColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: '✓',
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          icon: '✕',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          text: 'text-white',
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: 'ℹ',
        };
    }
  };

  const colors = getToastColors();
  const screenWidth = Dimensions.get('window').width;

  return (
    <Animated.View
      className={`${colors.bg} rounded-full px-6 py-3 mb-2 shadow-lg flex-row items-center pointer-events-auto`}
      style={{
        transform: [{ translateY }],
        opacity,
        maxWidth: screenWidth - 32,
      }}
    >
      <Text className={`${colors.text} text-base font-medium mr-2`}>
        {colors.icon}
      </Text>
      <Text className={`${colors.text} text-base font-medium flex-1`} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

/**
 * Convenience functions for different toast types
 */
export const toast = {
  success: (message: string, duration?: number) => {
    // This will be set by the provider
  },
  error: (message: string, duration?: number) => {
    // This will be set by the provider
  },
  info: (message: string, duration?: number) => {
    // This will be set by the provider
  },
  warning: (message: string, duration?: number) => {
    // This will be set by the provider
  },
};

// Helper to make toast available globally (optional)
let globalShowToast: ((message: string, type?: ToastType, duration?: number) => void) | null =
  null;

export function setGlobalToast(
  showToast: (message: string, type?: ToastType, duration?: number) => void
) {
  globalShowToast = showToast;

  // Set up convenience functions
  toast.success = (message: string, duration = 3000) => showToast(message, 'success', duration);
  toast.error = (message: string, duration = 3000) => showToast(message, 'error', duration);
  toast.info = (message: string, duration = 3000) => showToast(message, 'info', duration);
  toast.warning = (message: string, duration = 3000) => showToast(message, 'warning', duration);
}
