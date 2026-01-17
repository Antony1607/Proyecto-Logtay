'use client'
import { useEffect, useState } from 'react'
// Ruta corregida para tu estructura sin 'src'
import { supabase } from '../../lib/supabase' 

interface Conteo {
  Id: string          // PK en el diagrama de tu amigo
  campaign_id: string // FK hacia 'camping'
  user_id: string     // FK hacia 'Users'
  count_type: number  // Smallint en el diagrama
  created_at: string  // Timestamp
  location_id: string // FK hacia 'LOCATIONS'
}

export default function VerConteos() {
  const [conteos, setConteos] = useState<Conteo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConteos = async () => {
    try {
      setLoading(true)
      // Cambiado a 'Counts' según el diagrama de tu amigo
      const { data, error } = await supabase
        .from('Counts') 
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        alert('Error: ' + error.message)
      } else {
        setConteos(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConteos()
  }, [])

  return (
    <main className="p-8 bg-white min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Panel de Conteos (Semana 1)</h1>
          <button 
            onClick={fetchConteos}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition"
          >
            {loading ? 'Cargando...' : '🔄 Actualizar'}
          </button>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-sm text-slate-600">ID Conteo</th>
                <th className="p-4 font-semibold text-sm text-slate-600">ID Ubicación</th>
                <th className="p-4 font-semibold text-sm text-slate-600">Tipo</th>
                <th className="p-4 font-semibold text-sm text-slate-600">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {conteos.map((item) => (
                <tr key={item.Id} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-xs font-mono text-slate-500">{item.Id.slice(0,8)}...</td>
                  <td className="p-4 font-medium text-blue-600">{item.location_id}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.count_type === 1 ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {item.count_type === 1 ? '1er Conteo' : '2do Conteo'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {conteos.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-slate-400 italic">
                    No hay registros en la tabla "Counts".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}