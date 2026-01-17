'use client'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold tracking-tighter">LOGTAY</h1>
        <div className="flex gap-6 text-sm">
          <Link href="/" className="hover:text-blue-400 transition">Nueva Campaña</Link>
          <Link href="/conteos" className="hover:text-blue-400 transition">Ver Conteos</Link>
        </div>
      </div>
      <button 
        onClick={handleSignOut}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
      >
        Cerrar Sesión
      </button>
    </nav>
  )
}