'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Capture tous les paramètres d'URL pour le débogage
    const params = Object.fromEntries(searchParams.entries());
    
    console.log("[LOGIN] URL parameters:", params);
    
    // Handle error from URL
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const errorDescription = searchParams.get('error_description') || '';
      
      console.error("[LOGIN] Auth error:", { error: errorParam, description: errorDescription });
      
      if (errorParam === 'Callback') {
        setError('Erreur de connexion avec Google. Détails: ' + errorDescription);
      } else if (errorParam) {
        setError(`Erreur d'authentification: ${errorParam} (${errorDescription})`);
      }
    }
    
    // Vérifier aussi le paramètre callbackUrl
    const callbackUrl = searchParams.get('callbackUrl');
    if (callbackUrl) {
      console.log("[LOGIN] Callback URL:", callbackUrl);
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      console.log("[LOGIN] Attempting credential login");
      const res = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      })

      console.log("[LOGIN] Credential login result:", res);

      if (res?.error) {
        setError('Identifiants invalides')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error("[LOGIN] Credential login error:", error);
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    try {
      setIsLoading(true)
      console.log("[LOGIN] Initiating Google sign-in");
      
      // Log current origin for debugging
      console.log("[LOGIN] Current origin:", window.location.origin);
      
      // Generate a timestamp parameter to prevent caching issues
      const ts = new Date().getTime();
      
      signIn('google', { 
        callbackUrl: `${window.location.origin}/dashboard?ts=${ts}`
      })
    } catch (error) {
      console.error("[LOGIN] Error initiating Google sign-in:", error);
      setError('Erreur lors de la tentative de connexion Google');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center">Connexion</h2>
          
          {error && (
            <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                name="password"
                type="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>
            
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full mt-4 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <FcGoogle size={20} />
              <span>Se connecter avec Google</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}