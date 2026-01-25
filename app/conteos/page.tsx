'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useSearchParams } from 'next/navigation'
import Navbar from '../../components/Navbar'
import * as XLSX from 'xlsx'

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
    const { data: camp } = await supabase.from('campaigns').select('name').eq('id', campaignId).single()
    if (camp) setNombreCampana(camp.name)

    const { data } = await supabase
      .from('count_lines')
      .select(`
        quantity,
        products (product_code, name, system_stock),
        counts!inner (count_type, campaign_id)
      `)
      .eq('counts.campaign_id', campaignId)

    if (data) {
      const productosMap: any = {}
      data.forEach((row: any) => {
        const sku = row.products?.product_code || 'SIN-CODIGO'
        if (!productosMap[sku]) {
          productosMap[sku] = { 
            sku, 
            nombre: row.products?.name || 'Desconocido', 
            sistema: row.products?.system_stock || 0, // Dato del Excel
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

  // EXCEL COMPLETO
  const exportarExcel = () => {
    const dataParaExcel = datosReporte.map(item => {
      const final = item.conteo2 > 0 ? item.conteo2 : item.conteo1
      return {
        'SKU': item.sku,
        'Producto': item.nombre,
        'Stock Sistema': item.sistema,
        'Conteo 1': item.conteo1,
        'Conteo 2': item.conteo2,
        'Diferencia': final - item.sistema,
        'Estado': (final - item.sistema) === 0 ? 'OK' : 'ERROR'
      }
    })

    const ws = XLSX.utils.json_to_sheet(dataParaExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Auditoria")
    XLSX.writeFile(wb, `Reporte_${nombreCampana}.xlsx`)
  }

  // CÁLCULOS PARA LAS TARJETAS (METRICS)
  const totalItems = datosReporte.length
  
  // Calculamos cuántos coinciden EXACTAMENTE (Conteo Final == Sistema)
  const exactos = datosReporte.filter(i => {
    const final = i.conteo2 > 0 ? i.conteo2 : i.conteo1
    return final === i.sistema
  }).length

  const porcentajeExactitud = totalItems > 0 
    ? Math.round((exactos / totalItems) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="p-4 md:p-10 max-w-7xl mx-auto"> {/* Ancho Original */}
        
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

        {/* DASHBOARD (ESTÉTICA ORIGINAL) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total SKUs</p>
            <p className="text-4xl font-black">{totalItems}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Con Diferencias</p>
            <p className="text-4xl font-black text-red-500">
              {totalItems - exactos}
            </p>
          </div>
          {/* TARJETA DE COINCIDENCIA RECUPERADA */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Coincidencia Exacta</p>
            <p className={`text-4xl font-black ${porcentajeExactitud > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {porcentajeExactitud}%
            </p>
          </div>
        </div>

        {/* TABLA CON 5 COLUMNAS (ESTÉTICA ORIGINAL) */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest text-center">
                <th className="p-6 text-left">Producto</th>
                <th className="p-6">Stock</th>
                <th className="p-6">Conteo 1</th>
                <th className="p-6">Conteo 2</th>
                <th className="p-6 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datosReporte.map((item, idx) => {
                const final = item.conteo2 > 0 ? item.conteo2 : item.conteo1
                const dif = final - item.sistema
                const hayC2 = item.conteo2 > 0

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-slate-800">{item.nombre}</p>
                      <p className="text-blue-500 font-mono text-xs">{item.sku}</p>
                    </td>
                    
                    {/* SISTEMA */}
                    <td className="p-6 text-center font-bold text-slate-500 bg-slate-50/50">
                      {item.sistema}
                    </td>

                    {/* CONTEO 1 (Tachado si hay C2) */}
                    <td className={`p-6 text-center font-bold ${hayC2 ? 'text-slate-300 line-through decoration-red-300' : 'text-slate-700'}`}>
                      {item.conteo1}
                    </td>

                    {/* CONTEO 2 */}
                    <td className="p-6 text-center">
                       {hayC2 ? (
                         <span className="font-black text-blue-600 text-lg">{item.conteo2}</span>
                       ) : (
                         <span className="text-slate-200 text-xs">-</span>
                       )}
                    </td>

                    {/* DIFERENCIA */}
                    <td className={`p-6 text-right font-black text-xl ${dif === 0 ? 'text-slate-300' : dif > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {dif > 0 ? `+${dif}` : dif === 0 ? 'OK' : dif}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {datosReporte.length === 0 && !loading && (
             <div className="p-10 text-center text-slate-400 italic">
               Sin datos disponibles en esta campaña.
             </div>
          )}
        </div>
      </main>
    </div>
  )
}