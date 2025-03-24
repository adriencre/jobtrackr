'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue')
      } else {
        router.push('/login?registered=true')
      }
    } catch (error) {
      setError('Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center">Inscription</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                name="name"
                type="text"
                placeholder="Nom"
                value={form.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
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
                minLength={6}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : 'S\'inscrire'}
            </Button>
          </form>
          
          <p className="text-center text-sm mt-4">
            Déjà inscrit? <Link href="/login" className="text-blue-600 hover:underline">Se connecter</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}