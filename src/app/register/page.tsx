'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import axios from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post('/api/register', form)
      router.push('/login')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l’inscription')
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px]">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Inscription</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Nom" value={form.name} onChange={handleChange} required />
            <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <Input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">S'inscrire</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
