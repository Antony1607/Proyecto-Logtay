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

    const { data: camp } = await supabase
      .from('campaigns')
      .select('name')
      .eq('id', campaignId)
      .single()

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
            sistema: row.products?.system_stock || 0,
            conteo1: 0,
            conteo2: 0,
          }
        }

        if (row.counts.count_type === 1)
          productosMap[sku].conteo1 += row.quantity

        if (row.counts.count_type === 2)
          productosMap[sku].conteo2 += row.quantity
      })

      setDatosReporte(Object.values(productosMap))
    }

    setLoading(false)
  }

  const exportarExcel = () => {
    const dataParaExcel = datosReporte.map((item) => {
      const final = item.conteo2 > 0 ? item.conteo2 : item.conteo1

      return {
        SKU: item.sku,
        Producto: item.nombre,
        'Stock Sistema': item.sistema,
        'Conteo 1': item.conteo1,
        'Conteo 2': item.conteo2,
        Diferencia: final - item.sistema,
        Estado: (final - item.sistema) === 0 ? 'OK' : 'ERROR',
      }
    })

    const ws = XLSX.utils.json_to_sheet(dataParaExcel)
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, 'Auditoria')
    XLSX.writeFile(wb, `Reporte_${nombreCampana}.xlsx`)
  }

  const totalItems = datosReporte.length

  const exactos = datosReporte.filter((i) => {
    const final = i.conteo2 > 0 ? i.conteo2 : i.conteo1
    return final === i.sistema
  }).length

  const porcentajeExactitud =
    totalItems > 0
      ? Math.round((exactos / totalItems) * 100)
      : 0

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="p-4 md:p-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Análisis de Diferencias
            </h1>

            <p className="text-slate-500 font-medium">
              Campaña:{' '}
              <span className="text-blue-600 uppercase font-bold">
                {nombreCampana}
              </span>
            </p>
          </div>

          <button
            onClick={exportarExcel}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
          >
            <span>📥</span> DESCARGAR EXCEL
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Total SKUs
            </p>

            <p className="text-4xl font-black">{totalItems}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Con Diferencias
            </p>

            <p className="text-4xl font-black text-red-500">
              {totalItems - exactos}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Coincidencia Exacta
            </p>

            <p
              className={`text-4xl font-black ${
                porcentajeExactitud > 90
                  ? 'text-emerald-500'
                  : 'text-amber-500'
              }`}
            >
              {porcentajeExactitud}%
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}