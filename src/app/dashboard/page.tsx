// src/app/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Application {
  id: string
  company: string
  position: string
  contract: string // Garde le nom original de la propriété
  status: string
  appliedAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications')
        const data = await res.json()
        if (Array.isArray(data)) {
          setApplications(data)
        } else {
          setApplications([])
        }
      } catch (err) {
        console.error('Erreur de chargement des candidatures', err)
        setApplications([])
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const getStatCount = (statusToCheck: string) =>
    applications.filter((a) => a.status.toLowerCase() === statusToCheck.toLowerCase()).length

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Es-tu sûr de vouloir supprimer cette candidature ?')
    if (!confirmDelete) return

    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setApplications((prev) => prev.filter((app) => app.id !== id))
    } else {
      alert("Erreur lors de la suppression")
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' || 
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === '' || 
      app.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  // Fonction pour obtenir l'initiale d'une entreprise
  const getInitial = (company: string) => {
    return company.charAt(0).toUpperCase()
  }

  // Fonction pour obtenir une couleur en fonction du statut
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'envoyé' || statusLower === 'sent') return 'bg-blue-50 text-blue-600 border-blue-200'
    if (statusLower === 'relancé' || statusLower === 'interview') return 'bg-green-50 text-green-600 border-green-200'
    if (statusLower === 'refusé' || statusLower === 'rejected') return 'bg-red-50 text-red-600 border-red-200'
    if (statusLower === 'pending') return 'bg-yellow-50 text-yellow-600 border-yellow-200'
    return 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord des candidatures</h1>
        <Button 
          onClick={() => router.push('/dashboard/new')}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          + Nouvelle candidature
        </Button>
      </header>

      {/* Cards statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="overflow-hidden border rounded-lg">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 mb-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Total</p>
            <h2 className="text-xl font-bold">{applications.length}</h2>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border rounded-lg">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 mb-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Envoyé</p>
            <h2 className="text-xl font-bold">{getStatCount('Envoyé')}</h2>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border rounded-lg">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 mb-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Relancé</p>
            <h2 className="text-xl font-bold">{getStatCount('Relancé')}</h2>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border rounded-lg">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 mb-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Refusé</p>
            <h2 className="text-xl font-bold">{getStatCount('Refusé')}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Filtre et recherche */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            type="search"
            placeholder="Rechercher une candidature..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="envoyé">Envoyé</option>
            <option value="relancé">Relancé</option>
            <option value="refusé">Refusé</option>
          </select>
          
          <div className="flex gap-2">
            <button className="p-2 rounded-md border border-gray-300 hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            <button className="p-2 rounded-md border border-gray-300 hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des candidatures */}
      <div className="overflow-x-auto bg-white rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poste
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contrat
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">Chargement...</td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">Aucune candidature</td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-md">
                        {getInitial(app.company)}
                      </div>
                      <div className="ml-4">
                        <a 
                          href="#" 
                          className="text-blue-600 hover:underline"
                          onClick={() => router.push(`/dashboard/view/${app.id}`)}
                        >
                          {app.company}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">{app.contract}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(app.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}