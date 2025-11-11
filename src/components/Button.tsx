import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
}: ButtonProps) {
  const getVariantStyles = () => {
    if (disabled) {
      return 'bg-gray-300';
    }

    switch (variant) {
      case 'primary':
        return 'bg-primary-500';
      case 'secondary':
        return 'bg-gray-700';
      case 'outline':
        return 'bg-transparent border-2 border-primary-500';
      case 'danger':
        return 'bg-danger-500';
      default:
        return 'bg-primary-500';
    }
  };

  const getTextStyles = () => {
    if (disabled) {
      return 'text-gray-500';
    }

    if (variant === 'outline') {
      return 'text-primary-500';
    }

    return 'text-white';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2';
      case 'medium':
        return 'px-6 py-3';
      case 'large':
        return 'px-8 py-4';
      default:
        return 'px-6 py-3';
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-xl flex-row items-center justify-center ${getVariantStyles()} ${getSizeStyles()}`}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary[500] : COLORS.white}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`font-semibold ${getTextStyles()} ${getTextSizeStyles()}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
