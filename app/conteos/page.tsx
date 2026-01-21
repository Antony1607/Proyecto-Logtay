'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useSearchParams } from 'next/navigation'
import Navbar from '../../components/Navbar'
import * as XLSX from 'xlsx' // Importamos para el Excel

export default function ReporteDiferencias() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('id')
  const [datosReporte, setDatosReporte] = useState<any[]>([])
  const [nombreCampana, setNombreCampana] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!campaignId) return
    fetchData()
  }, [campaignId])

  const fetchData = async () => {
    setLoading(true)
    // 1. Obtener info de campaña
    const { data: camp } = await supabase.from('campaigns').select('name').eq('id', campaignId).single()
    if (camp) setNombreCampana(camp.name)

    // 2. Obtener conteos y líneas con lógica de agrupación
    const { data, error } = await supabase
      .from('count_lines')
      .select(`
        quantity,
        products (product_code, name),
        counts!inner (count_type, campaign_id)
      `)
      .eq('counts.campaign_id', campaignId)

    if (data) {
      // Agrupamos por producto para comparar Conteo 1 vs Conteo 2
      const productosMap: any = {}
      data.forEach((row: any) => {
        const sku = row.products.product_code
        if (!productosMap[sku]) {
          productosMap[sku] = { 
            sku, 
            nombre: row.products.name, 
            conteo1: 0, 
            conteo2: 0 
          }
        }
        if (row.counts.count_type === 1) productosMap[sku].conteo1 += row.quantity
        if (row.counts.count_type === 2) productosMap[sku].conteo2 += row.quantity
      })
      setDatosReporte(Object.values(productosMap))
    }
    setLoading(false)
  }

  // FUNCIÓN PARA EXPORTAR EXCEL
  const exportarExcel = () => {
    const dataParaExcel = datosReporte.map(item => ({
      'SKU': item.sku,
      'Producto': item.nombre,
      'Primer Conteo': item.conteo1,
      'Segundo Conteo': item.conteo2,
      'Diferencia': item.conteo2 - item.conteo1
    }))

    const ws = XLSX.utils.json_to_sheet(dataParaExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Diferencias")
    XLSX.writeFile(wb, `Reporte_${nombreCampana}.xlsx`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="p-4 md:p-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Análisis de Diferencias</h1>
            <p className="text-slate-500 font-medium">Campaña: <span className="text-blue-600 uppercase font-bold">{nombreCampana}</span></p>
          </div>
          <button 
            onClick={exportarExcel}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
          >
            <span>📥</span> DESCARGAR EXCEL
          </button>
        </header>

        {/* DASHBOARD DE AVANCE RÁPIDO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total SKUs</p>
            <p className="text-4xl font-black">{datosReporte.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Con Diferencias</p>
            <p className="text-4xl font-black text-red-500">
              {datosReporte.filter(i => i.conteo1 !== i.conteo2).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Coincidencia Exacta</p>
            <p className="text-4xl font-black text-emerald-500">
              {Math.round((datosReporte.filter(i => i.conteo1 === i.conteo2).length / datosReporte.length) * 100 || 0)}%
            </p>
          </div>
        </div>

        {/* TABLA DE DIFERENCIAS */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest">
                <th className="p-6">Producto</th>
                <th className="p-6 text-center">Conteo 1</th>
                <th className="p-6 text-center">Conteo 2</th>
                <th className="p-6 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datosReporte.map((item, idx) => {
                const dif = item.conteo2 - item.conteo1
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-slate-800">{item.nombre}</p>
                      <p className="text-blue-500 font-mono text-xs">{item.sku}</p>
                    </td>
                    <td className="p-6 text-center font-bold text-slate-600">{item.conteo1}</td>
                    <td className="p-6 text-center font-bold text-slate-600">{item.conteo2}</td>
                    <td className={`p-6 text-right font-black text-xl ${dif === 0 ? 'text-slate-300' : dif > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {dif > 0 ? `+${dif}` : dif}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}