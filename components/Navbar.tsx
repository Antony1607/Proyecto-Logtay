'use client'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="flex items-center justify-between bg-slate-900 p-4 text-white shadow-lg">
      <div className="flex gap-8 items-center">
        <h1 className="text-xl font-bold text-blue-400">LOGTAY</h1>
        <Link href="/" className="hover:text-blue-300 transition">Nueva Campaña</Link>
        <Link href="/conteos" className="hover:text-blue-300 transition">Ver Conteos</Link>
      </div>
      <button 
        onClick={handleSignOut}
        className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-md text-sm transition"
      >
        Cerrar Sesión
      </button>
    </nav>
  )
}