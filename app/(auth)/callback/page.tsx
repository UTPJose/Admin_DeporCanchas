'use client'

import dynamic from 'next/dynamic'

// Dinamically import the callback content to avoid Suspense issues
const CallbackContent = dynamic(() => import('./CallbackContent'), {
  ssr: false,
})

export default function CallbackPage() {
  return <CallbackContent />
}

