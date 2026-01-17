'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar' // Lo crearemos ahora
import CrearCampana from '../components/CrearCampaña' // Moveremos el código aquí

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 1. Revisar si el usuario está logueado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login') // Si no hay sesión, al Login
      } else {
        setSession(session)
      }
      setLoading(false)
    })
  }, [router])

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando Logtay...</div>

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar /> 
      <div className="p-8">
        <CrearCampana />
      </div>
    </main>
  )
}