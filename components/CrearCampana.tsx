'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function CrearCampana() {
  const [nombre, setNombre] = useState('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [campanas, setCampanas] = useState<any[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState('')

  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase.from('users').select('company_id').eq('id', user.id).single()
    if (userData?.company_id) {
      setCompanyId(userData.company_id)
      const { data } = await supabase.from('campaigns').select('*').eq('company_id', userData.company_id).order('created_at', { ascending: false })
      setCampanas(data || [])
    }
  }

  useEffect(() => { cargarDatos() }, [])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    const { error } = await supabase.from('campaigns').insert([{ name: nombre, status: 'active', company_id: companyId }])
    if (!error) { setNombre(''); cargarDatos(); }
  }

  const handleEliminar = async (id: string) => {
    if (confirm('¿Eliminar campaña? Esto afectará los conteos móviles.')) {
      await supabase.from('campaigns').delete().eq('id', id)
      cargarDatos()
    }
  }

  const handleGuardarEdicion = async (id: string) => {
    await supabase.from('campaigns').update({ name: nuevoNombre }).eq('id', id)
    setEditandoId(null)
    cargarDatos()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulario Crear */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Nueva Campaña</h2>
        <form onSubmit={handleCrear} className="space-y-4">
          <input 
            type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
            className="w-full border p-3 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nombre (ej. Inventario 2025)" required 
          />
          <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all">Crear Campaña</button>
        </form>
      </div>

      {/* Lista para Seguimiento */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Campaña</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {campanas.map((camp) => (
              <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium">
                  {editandoId === camp.id ? (
                    <input className="border p-1 rounded w-full text-slate-900" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} autoFocus />
                  ) : camp.name}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3 font-bold text-[11px]">
                  {editandoId === camp.id ? (
                    <button onClick={() => handleGuardarEdicion(camp.id)} className="text-green-600">GUARDAR</button>
                  ) : (
                    <>
                      <Link href={`/conteos?id=${camp.id}`} className="text-blue-600">CONTEOS</Link>
                      <button onClick={() => { setEditandoId(camp.id); setNuevoNombre(camp.name); }} className="text-amber-500">EDITAR</button>
                      <button onClick={() => handleEliminar(camp.id)} className="text-red-500">BORRAR</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}