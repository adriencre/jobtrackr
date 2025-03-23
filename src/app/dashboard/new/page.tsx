'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { CONTRACT_TYPES, STATUS_OPTIONS } from '@/lib/constants'

export default function NewApplicationPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    company: '',
    position: '',
    contract: 'CDI',
    status: 'À faire',
    link: '',
    contactMethod: 'linkedin', // Default contact method
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    tags: ['React', 'Node.js', 'Paris'],
    newTag: '',
    notes: '',
    appliedAt: new Date().toISOString().split('T')[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const addTag = () => {
    if (form.newTag && !form.tags.includes(form.newTag)) {
      setForm({ ...form, tags: [...form.tags, form.newTag], newTag: '' })
    }
  }

  const handleSubmit = async () => {
    const payload = {
      ...form,
      appliedAt: new Date(form.appliedAt),
      tags: form.tags,
    }

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) router.push('/dashboard')
    else alert("Erreur lors de l'envoi de la candidature")
  }

  const setContactMethod = (method: string) => {
    setForm({ ...form, contactMethod: method })
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-6">
      <div className="flex items-center mb-2">
        <h1 className="text-2xl font-bold">Ajouter une candidature</h1>
      </div>
      <p className="text-gray-600 mb-6">Remplissez les informations pour suivre votre nouvelle candidature</p>

      <div className="bg-white rounded-lg p-6 space-y-8 shadow-sm">
        {/* Première ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</Label>
            <Input 
              name="company" 
              value={form.company} 
              onChange={handleChange} 
              placeholder="ex: Google" 
              className="w-full"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Intitulé du poste</Label>
            <Input 
              name="position" 
              value={form.position} 
              onChange={handleChange} 
              placeholder="ex: Développeur Frontend"
              className="w-full" 
            />
          </div>
        </div>

        {/* Deuxième ligne */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</Label>
            <Select value={form.contract} onValueChange={(value) => setForm({ ...form, contract: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un contrat" />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Date d'envoi</Label>
            <Input 
              type="date" 
              name="appliedAt" 
              value={form.appliedAt} 
              onChange={handleChange}
              className="w-full" 
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Statut</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Moyen de contact */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Moyen de contact</Label>
          <div className="flex space-x-4 mt-1">
            <button
              type="button"
              onClick={() => setContactMethod('linkedin')}
              className={`flex items-center px-4 py-2 rounded-md ${
                form.contactMethod === 'linkedin' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-300' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
              </svg>
              LinkedIn
            </button>
            <button
              type="button"
              onClick={() => setContactMethod('email')}
              className={`flex items-center px-4 py-2 rounded-md ${
                form.contactMethod === 'email' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-300' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
              </svg>
              Email
            </button>
            <button
              type="button"
              onClick={() => setContactMethod('website')}
              className={`flex items-center px-4 py-2 rounded-md ${
                form.contactMethod === 'website' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-300' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"></path>
              </svg>
              Site web
            </button>
          </div>
        </div>

        {/* Lien de l'offre */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Lien de l'offre</Label>
          <Input 
            name="link" 
            value={form.link} 
            onChange={handleChange} 
            placeholder="https://" 
            className="w-full"
          />
        </div>

        {/* Tags */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Tags</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.tags.map((tag, index) => (
              <Badge 
                key={index} 
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full px-3 py-1 text-sm"
              >
                {tag}
              </Badge>
            ))}
            <button 
              onClick={() => {}}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 rounded-full px-3 py-1 border border-blue-200 hover:border-blue-400 bg-white"
            >
              <span className="mr-1">+</span> Ajouter
            </button>
          </div>
        </div>

        {/* Notes personnelles */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Notes personnelles</Label>
          <Textarea 
            name="notes" 
            value={form.notes} 
            onChange={handleChange} 
            placeholder="Ajoutez vos notes ici..." 
            className="w-full min-h-32"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="border-gray-300 text-gray-700"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  )
}