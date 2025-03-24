// components/AuthDebug.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AuthDebug() {
  const searchParams = useSearchParams()
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})

  useEffect(() => {
    // Rassembler les informations de debug
    const params = Object.fromEntries(searchParams.entries())
    
    // Ajouter des informations sur l'environnement
    const info = {
      ...params,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      nextAuthUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Non défini',
      baseUrl: window.location.origin,
      currentUrl: window.location.href,
      cookies: document.cookie ? 'Présents' : 'Absents'
    }
    
    setDebugInfo(info)
  }, [searchParams])

  if (Object.keys(debugInfo).length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm"
      >
        {showDebug ? 'Masquer debug' : 'Afficher debug'}
      </button>
      
      {showDebug && (
        <div className="mt-2 p-4 bg-gray-900 text-white rounded-lg max-w-lg max-h-96 overflow-auto">
          <h3 className="text-lg font-bold mb-2">Informations de débogage</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}