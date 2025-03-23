'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Application {
  id: string
  position: string
  company: string
  location?: string // ex: "Paris, France"
  status: string
  appliedAt: string
  link?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  tags: string[] | string
  notes?: string
}

// Define the possible statuses and their order
const statusSteps = {
  'À faire': 1,
  'Envoyé': 2,  // Changed from 'Attente' to 'Envoyé'
  'Relancé': 3,
  'Entretien': 4,
  'Accepté': 5,
  'Refusé': 3.5 // Between relancé and entretien
}

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [app, setApp] = useState<Application | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/applications/${id}`)
      const data = await res.json()

      // Convertir les tags en tableau si c'est une chaîne
      if (data?.tags && typeof data.tags === 'string') {
        data.tags = data.tags.split(',')
      }
      setApp(data)
    }
    fetchData()
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette candidature ?")) return
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/dashboard')
    else alert("Erreur lors de la suppression")
  }

  if (!app) {
    return <div className="p-6">Chargement...</div>
  }

  // Helper function to determine if a step is active
  const isStepActive = (stepName: string) => {
    const currentStatusValue = statusSteps[app.status as keyof typeof statusSteps] || 0
    const stepValue = statusSteps[stepName as keyof typeof statusSteps] || 0
    
    // For Refusé, we need special handling
    if (app.status === 'Refusé') {
      // If we're checking the status of a step that comes before Refusé
      if (stepValue < statusSteps['Refusé']) {
        return true
      }
      // Only the Refusé step itself should be active
      return stepName === 'Refusé'
    }
    
    return stepValue <= currentStatusValue
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-6">
        <span className="text-gray-500">Dashboard</span>
        <span className="mx-2">›</span>
        <span>Détails de la candidature</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            {/* Titre (app.position) */}
            <h1 className="text-2xl font-bold">{app.position}</h1>

            {/* Entreprise + localisation dynamique */}
            <div className="flex items-center mt-2 text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"></path>
                </svg>
                {app.company || 'Entreprise non renseignée'}
              </div>
              {/* location */}
              {app.location && (
                <div className="flex items-center ml-4">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
                  </svg>
                  {app.location}
                </div>
              )}
            </div>
          </div>

          {/* Boutons Edit / Delete */}
          <div className="flex space-x-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push(`/dashboard/edit/${app.id}`)}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              Modifier
            </Button>

            <Button
              onClick={handleDelete}
              variant="outline"
              className="border-gray-300 text-red-700 hover:bg-red-50"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Status and Tags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Application Status - 2/3 de la width */}
        <div className="md:col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Application Status</h2>

          {/* Barre de progression améliorée */}
          <div className="flex w-full mb-6">
            {/* À faire */}
            <div className="flex-1 relative">
              <div
                className={`h-2 ${
                  isStepActive('À faire') ? 'bg-blue-600' : 'bg-gray-200'
                } rounded-l-full absolute top-0 left-0 right-0`}
              ></div>
              <div className="mt-6">
                <div className="font-medium">À faire</div>
                <div className="text-sm text-gray-500">
                  {app.status === 'À faire' ? 'Étape actuelle' : ''}
                </div>
              </div>
            </div>

            {/* Envoyé */}
            <div className="flex-1 relative">
              <div
                className={`h-2 ${
                  isStepActive('Envoyé') ? 'bg-blue-600' : 'bg-gray-200'
                } absolute top-0 left-0 right-0`}
              ></div>
              <div className="mt-6">
                <div className="font-medium">Envoyé</div>
                <div className="text-sm text-gray-500">
                  {app.status === 'Envoyé' ? 'Étape actuelle' : ''}
                </div>
              </div>
            </div>

            {/* Branche: soit Relancé, soit Refusé */}
            <div className="flex-1 relative">
              <div
                className={`h-2 ${
                  app.status === 'Refusé' 
                    ? 'bg-red-500' 
                    : isStepActive('Relancé') 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200'
                } absolute top-0 left-0 right-0`}
              ></div>
              <div className="mt-6">
                <div className="font-medium">
                  {app.status === 'Refusé' ? 'Refusé' : 'Relancé'}
                </div>
                <div className="text-sm text-gray-500">
                  {(app.status === 'Relancé' || app.status === 'Refusé') ? 'Étape actuelle' : ''}
                </div>
              </div>
            </div>

            {/* Entretien (seulement visible si pas refusé) */}
            <div className={`flex-1 relative ${app.status === 'Refusé' ? 'opacity-50' : ''}`}>
              <div
                className={`h-2 ${
                  app.status === 'Refusé' 
                    ? 'bg-gray-200' 
                    : isStepActive('Entretien') 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200'
                } absolute top-0 left-0 right-0`}
              ></div>
              <div className="mt-6">
                <div className="font-medium">Entretien</div>
                <div className="text-sm text-gray-500">
                  {app.status === 'Entretien' ? 'Étape actuelle' : ''}
                </div>
              </div>
            </div>

            {/* Accepté (seulement visible si pas refusé) */}
            <div className={`flex-1 relative ${app.status === 'Refusé' ? 'opacity-50' : ''}`}>
              <div
                className={`h-2 ${
                  app.status === 'Accepté' ? 'bg-green-600' : 'bg-gray-200'
                } rounded-r-full absolute top-0 left-0 right-0`}
              ></div>
              <div className="mt-6">
                <div className="font-medium">Accepté</div>
                <div className="text-sm text-gray-500">
                  {app.status === 'Accepté' ? 'Étape actuelle' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <Badge className={`px-3 py-1 text-sm rounded-full ${
              app.status === 'Accepté' ? 'bg-green-100 text-green-800' : 
              app.status === 'Refusé' ? 'bg-red-100 text-red-800' :
              app.status === 'Entretien' ? 'bg-purple-100 text-purple-800' :
              app.status === 'Relancé' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {app.status}
            </Badge>
            
            <span className="ml-2 text-sm text-gray-500">
              Candidature créée le {new Date(app.appliedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tags - 1/3 de la width */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(app.tags) && app.tags.map((tag, index) => (
              <Badge key={index} className="bg-blue-100 text-blue-800 rounded-full px-3 py-1">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline and Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          <p className="text-gray-700">
            {app.notes
              ? app.notes
              : 'Aucune note. Pour ajouter des notes, modifiez la candidature.'}
          </p>
        </div>
        
        {/* Contact */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Contact</h2>
          <div className="space-y-4">
            {app.contactName && (
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <span>{app.contactName}</span>
              </div>
            )}

            {app.contactEmail && (
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <span>{app.contactEmail}</span>
              </div>
            )}

            {app.contactPhone && (
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <span>{app.contactPhone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}