'use client'

import React from 'react'

/**
 * Card Component - Tarjeta reutilizable
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function Card({ children, header, footer, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-white border border-border-color rounded-lg shadow-sm overflow-hidden ${className || ''}`}
    >
      {header && <div className="border-b border-border-color px-6 py-4">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="border-t border-border-color px-6 py-4 bg-bg-light">{footer}</div>}
    </div>
  )
}

/**
 * Card Header
 */
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-bold text-text-dark text-lg ${className || ''}`}>{children}</div>
}

/**
 * Card Content
 */
export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

/**
 * Card Footer
 */
export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex gap-2 ${className || ''}`}>{children}</div>
}
