'use client'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-xl">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-black tracking-tighter text-blue-400">LOGTAY <span className="text-white text-xs font-light">MVP</span></h1>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-400 transition">Campañas</Link>
          <Link href="/productos" className="hover:text-blue-400 transition">Productos</Link>
          <Link href="/ubicaciones" className="hover:text-blue-400 transition">Ubicaciones</Link>
        </div>
      </div>
      <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-xs font-bold transition-all">
        Cerrar Sesión
      </button>
    </nav>
  )
}