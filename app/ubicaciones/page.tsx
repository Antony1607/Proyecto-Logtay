'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import Papa from 'papaparse'

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: userData } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      if (userData) {
        setCompanyId(userData.company_id)
        cargarUbicaciones(userData.company_id)
      }
    }
    init()
  }, [])

  const cargarUbicaciones = async (cId: string) => {
    const { data } = await supabase
      .from('locations')
      .select('*')
      .eq('company_id', cId)
      .order('location_code', { ascending: true })
    setUbicaciones(data || [])
  }

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file || !companyId) return

    setLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { error: deleteError } = await supabase
          .from('locations')
          .delete()
          .eq('company_id', companyId)

        if (deleteError) {
          alert("Error al limpiar ubicaciones anteriores: " + deleteError.message)
          setLoading(false)
          return
        }

        const nuevasUbicaciones = results.data.map((row: any) => ({
          location_code: row.codigo || row.code,
          description: row.descripcion || row.nombre,
          company_id: companyId
        }))

        const { error: insertError } = await supabase.from('locations').insert(nuevasUbicaciones)
        
        if (insertError) {
          alert("Error al insertar nuevas ubicaciones: " + insertError.message)
        } else {
          alert(`✅ ¡Éxito! Se actualizaron ${nuevasUbicaciones.length} ubicaciones.`)
          cargarUbicaciones(companyId)
        }
        setLoading(false)
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="p-8 max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Gestión de Ubicaciones</h1>
            <p className="text-slate-500">Define los puntos de control para el equipo móvil.</p>
          </div>
          <label className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold cursor-pointer hover:bg-slate-800 transition-all shadow-xl">
            {loading ? 'Subiendo y actualizando...' : '＋ ACTUALIZAR CSV'}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
          </label>
        </header>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b">
              <tr>
                <th className="p-5">ID / Código de Ubicación</th>
                <th className="p-5">Descripción / Referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ubicaciones.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-mono text-blue-600 font-bold">{u.location_code}</td>
                  <td className="p-5 font-medium text-slate-700">{u.description}</td>
                </tr>
              ))}
              {ubicaciones.length === 0 && !loading && (
                <tr>
                  <td colSpan={2} className="p-20 text-center text-slate-400 italic">
                    Sin ubicaciones cargadas actualmente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
