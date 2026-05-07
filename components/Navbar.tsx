'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  const [logo, setLogo] = useState<string | null>(null)
  const [empresaNombre, setEmpresaNombre] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const cachedLogo = localStorage.getItem('logtay_logo')
    const cachedName = localStorage.getItem('logtay_name')
    
    if (cachedLogo) setLogo(cachedLogo)
    if (cachedName) setEmpresaNombre(cachedName)


    cargarIdentidad()
  }, [])

  const cargarIdentidad = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: usuario } = await supabase
      .from('users')
      .select(`company_id, companies (name, logo_url)`)
      .eq('id', user.id)
      .single()

    if (usuario && usuario.companies && usuario.companies.length > 0) {

      setEmpresaNombre(usuario.companies[0].name)
  setLogo(usuario.companies[0].logo_url)

      if (usuario.companies.logo_url) {
        localStorage.setItem('logtay_logo', usuario.companies.logo_url)
      }
      if (usuario.companies.name) {
        localStorage.setItem('logtay_name', usuario.companies.name)
      }
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()

    localStorage.removeItem('logtay_logo')
    localStorage.removeItem('logtay_name')
    router.push('/login')
  }

  return (
    <nav className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center shadow-xl sticky top-0 z-50 border-b border-slate-800 h-[72px]">
 
      
      <div className="flex items-center gap-8">
        

        <div className="flex items-center gap-4">
          
   
          <div className="flex flex-col select-none cursor-pointer" onClick={() => router.push('/')}>
            <h1 className="text-2xl font-black tracking-tighter text-blue-500 leading-none hover:text-blue-400 transition">
              LOGTAY
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              Inventory
            </span>
          </div>


          {logo && (
            <div className="flex items-center gap-3 animate-fadeIn">

              <div className="h-8 w-[1px] bg-slate-700 mx-1"></div>


              <img 
                src={logo} 
                alt={empresaNombre} 
                className="h-8 w-auto object-contain bg-white rounded px-1 shadow-sm" 
              />
              

              <span className="text-sm font-bold text-white hidden md:block opacity-90">
                {empresaNombre}
              </span>
            </div>
          )}
        </div>


        <div className="hidden md:flex gap-2 text-sm font-bold text-slate-300">
          <Link href="/" className="hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-all">
            Campañas
          </Link>
          <Link href="/productos" className="hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-all">
            Productos
          </Link>
          <Link href="/ubicaciones" className="hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-all">
            Ubicaciones
          </Link>
        </div>
      </div>

      <button 
        onClick={handleSignOut} 
        className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 px-4 py-2 rounded-lg text-xs font-bold transition-all"
      >
        SALIR
      </button>
    </nav>
  )
}