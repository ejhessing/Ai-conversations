import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable Card component
 * Provides consistent styling for card-based layouts
 */
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white rounded-2xl shadow-lg';
      case 'outlined':
        return 'bg-white rounded-2xl border-2 border-gray-200';
      case 'default':
      default:
        return 'bg-white rounded-2xl shadow-sm';
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      case 'md':
      default:
        return 'p-6';
    }
  };

  return (
    <View
      className={`${getVariantStyles()} ${getPaddingStyles()} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

/**
 * Card Section component
 * For organizing content within cards
 */
interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardSection({ children, className = '' }: CardSectionProps) {
  return <View className={`mb-4 ${className}`}>{children}</View>;
}

/**
 * Card Header component
 */
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function CardHeader({ title, subtitle, className = '' }: CardHeaderProps) {
  return (
    <View className={`mb-4 ${className}`}>
      <View className="text-lg font-semibold text-gray-900 mb-1">{title}</View>
      {subtitle && <View className="text-sm text-gray-600">{subtitle}</View>}
    </View>
  );
}
