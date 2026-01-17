'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase' 
import Navbar from '../../components/Navbar'

export default function VerConteos() {
  const [conteos, setConteos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConteos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('counts') // Nombre en minúsculas según tu captura
      .select('*, locations(location_code)') // Relación con locations
      .order('created_at', { ascending: false })

    if (!error) setConteos(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchConteos() }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />
      <main className="p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Registros en Tabla "Counts"</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-sm font-semibold">ID Ubicación</th>
                <th className="p-4 text-sm font-semibold">Tipo de Conteo</th>
                <th className="p-4 text-sm font-semibold">Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {conteos.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-mono text-sm">{item.location_id}</td>
                  <td className="p-4">{item.count_type === 1 ? 'Primer Conteo' : 'Reconteo'}</td>
                  <td className="p-4 text-slate-500">{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}