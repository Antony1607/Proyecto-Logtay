'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useSearchParams } from 'next/navigation'
import Navbar from '../../components/Navbar'

export default function VerConteos() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('id')
  const [lineas, setLineas] = useState<any[]>([])
  const [nombreCampana, setNombreCampana] = useState('')

  useEffect(() => {
    if (!campaignId) return
    const fetchDatos = async () => {
      const { data: camp } = await supabase.from('campaigns').select('name').eq('id', campaignId).single()
      if (camp) setNombreCampana(camp.name)

      const { data } = await supabase
        .from('count_lines')
        .select(`quantity, products(name, product_code), counts!inner(campaign_id, count_type)`)
        .eq('counts.campaign_id', campaignId)
      
      setLineas(data || [])
    }
    fetchDatos()
  }, [campaignId])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black italic">REPORTE: {nombreCampana}</h1>
            <p className="text-slate-500 text-sm">Monitoreo de escaneo en tiempo real (App Móvil)</p>
          </div>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs">PRÓXIMAMENTE: EXPORTAR EXCEL</button>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Tipo Conteo</th>
                <th className="p-4 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {lineas.map((line, i) => (
                <tr key={i} className="hover:bg-blue-50/50">
                  <td className="p-4 text-blue-600 font-mono">{line.products?.product_code}</td>
                  <td className="p-4">{line.products?.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[9px] ${line.counts.count_type === 1 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      CONTEO {line.counts.count_type}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-lg">{line.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}