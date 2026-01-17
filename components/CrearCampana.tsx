'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function CrearCampana() {
  const [nombre, setNombre] = useState('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  useEffect(() => {
    const getUserCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      setCompanyId(data?.company_id || null)
    }

    getUserCompany()
  }, [])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyId) {
      setMensaje({ tipo: 'error', texto: 'No se encontró la empresa del usuario' })
      return
    }

    const { error } = await supabase
      .from('campaigns')
      .insert([{
        name: nombre,
        status: 'active',
        company_id: companyId
      }])

    if (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    } else {
      setMensaje({ tipo: 'success', texto: '✅ Campaña creada correctamente' })
      setNombre('')
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md mx-auto">
      {/* Título con color gris muy oscuro casi negro */}
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Nueva Campaña</h2>
      
      <form onSubmit={handleCrear} className="space-y-4">
        <div>
          {/* Etiqueta opcional para mayor claridad */}
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre del Proyecto
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            // text-slate-900 asegura que lo que escribas sea negro/gris oscuro
            className="w-full border border-slate-300 p-3 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Ej: Inventario General 2024"
            required
          />
        </div>
        
        <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100">
          Crear Campaña
        </button>
      </form>

      {mensaje.texto && (
        <p className={`mt-4 text-center font-bold ${
          mensaje.tipo === 'error' ? 'text-red-600' : 'text-emerald-600'
        }`}>
          {mensaje.texto}
        </p>
      )}
    </div>
  )
}