'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase' 
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar' 
import CrearCampana from '../components/CrearCampana' 

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [tieneEmpresa, setTieneEmpresa] = useState(false)
  const router = useRouter()

  useEffect(() => {
    verificarSesion()
  }, [])

  const verificarSesion = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    

    if (!session) {
      router.push('/login')
      return
    }


    const { data: usuario } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', session.user.id)
      .single()


    if (!usuario?.company_id) {
      router.push('/seleccionar-empresa') 
    } else {
      setTieneEmpresa(true)
      setLoading(false) 
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <Navbar /> 
      
      <main className="flex-grow flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">

          {loading ? (

            <div className="animate-pulse space-y-8">

              <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
              
              <div className="bg-white p-8 rounded-3xl border border-slate-100 h-64 shadow-sm flex flex-col gap-4">
                 <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                 <div className="h-10 bg-slate-200 rounded w-full"></div>
                 <div className="h-10 bg-slate-200 rounded w-full"></div>
              </div>
            </div>
          ) : (

            tieneEmpresa && <CrearCampana />
          )}

        </div>
      </main>
    </div>
  )
}