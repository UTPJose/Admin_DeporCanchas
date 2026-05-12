'use client'

import React from 'react'

/**
 * Button Component - Botón reutilizable
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-medium rounded-lg transition-colors inline-flex items-center gap-2 justify-center'

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-gray-400',
    secondary: 'bg-gray-100 text-text-dark hover:bg-gray-200 disabled:bg-gray-200',
    danger: 'bg-danger text-white hover:bg-red-600 disabled:bg-gray-400',
    ghost: 'text-text-dark hover:bg-bg-light disabled:text-gray-400',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${props.className || ''}`}
    >
      {isLoading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  )
}
