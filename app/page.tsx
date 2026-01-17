'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase' 
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar' 
import CrearCampana from '../components/CrearCampana' 

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login') 
      } else {
        setLoading(false)
      }
    })
  }, [router])

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-900 font-bold">Cargando Logtay...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar /> 
      <main className="flex-grow flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <CrearCampana />
        </div>
      </main>
    </div>
  )
}