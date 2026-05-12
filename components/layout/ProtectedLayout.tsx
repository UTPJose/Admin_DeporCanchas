'use client'

import React, { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

/**
 * Protected Layout Component - Layout protegido para dashboard
 */

interface ProtectedLayoutProps {
  children: ReactNode
  requiredRole?: string[]
}

export function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="flex h-screen bg-bg-light">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="ml-64 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
