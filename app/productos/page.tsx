'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import Papa from 'papaparse'

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  
  // Campañas
  const [campanas, setCampanas] = useState<any[]>([])
  const [selectedCampana, setSelectedCampana] = useState<string>('')

  // Efecto Inicial
  useEffect(() => {
    obtenerDatosIniciales()
  }, [])

  // 🔄 Efecto Mágico: Cuando cambias la campaña, recarga la tabla
  useEffect(() => {
    if (companyId) {
      cargarTablaDinamica()
    }
  }, [selectedCampana, companyId])

  const obtenerDatosIniciales = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase.from('users').select('company_id').eq('id', user.id).single()
    if (userData) {
      setCompanyId(userData.company_id)
      cargarCampanas(userData.company_id)
    }
  }

  const cargarCampanas = async (cId: string) => {
    const { data } = await supabase
      .from('campaigns')
      .select('id, name')
      .eq('company_id', cId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    setCampanas(data || [])
  }

  // 🧠 EL CEREBRO DE LA TABLA
  const cargarTablaDinamica = async () => {
    setLoading(true)
    if (!companyId) return

    if (selectedCampana === '') {
      // MODO 1: VER CATÁLOGO GLOBAL (Tabla products)
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', companyId)
        .order('name')
      
      setProductos(data || [])

    } else {
      // MODO 2: VER CAMPAÑA ESPECÍFICA (Tabla campaign_goals + JOIN products)
      const { data, error } = await supabase
        .from('campaign_goals')
        .select(`
          expected_stock,
          product_code,
          products (name, category) 
        `)
        .eq('campaign_id', selectedCampana)
        .order('product_code')

        if (error) console.error(error)

        const datosFormateados = (data || []).map((item: any) => ({
          product_code: item.product_code,
          name: item.products?.name || 'Producto Desconocido',
          category: item.products?.category || 'General',
          system_stock: item.expected_stock
        }))

        setProductos(datosFormateados)
    }
    setLoading(false)
  }

  const descargarPlantilla = () => {
    const headers = ['Código', 'Descripción', 'Cantidad', 'Categoría']
    const ejemplo = ['A-001', 'Coca Cola 500ml', '100', 'Bebidas']
    const csvContent = '\uFEFF' + [headers, ejemplo].map(e => e.join(';')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla_inventario.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file || !companyId) return

    setLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      complete: async (results) => {
        
        // 1. Siempre actualizamos/creamos los productos en el Maestro Global
        const productosMaestros = results.data.map((row: any) => ({
          product_code: row['codigo'] || row['sku'] || row['id'], 
          name: row['descripcion'] || row['nombre'],
          category: row['categoria'] || 'General',
          system_stock: 0, 
          company_id: companyId
        })).filter((p: any) => p.product_code && p.name)

        if (productosMaestros.length === 0) {
           alert("⚠️ Archivo vacío o incorrecto."); setLoading(false); return;
        }

        await supabase.from('products').upsert(productosMaestros, { onConflict: 'product_code' })

        // 2. Si hay campaña seleccionada, subimos las metas
        if (selectedCampana) {
           const metasCampaña = results.data.map((row: any) => ({
             campaign_id: selectedCampana,
             product_code: row['codigo'] || row['sku'],
             expected_stock: Number(row['cantidad'] || row['stock'] || 0)
           })).filter((m: any) => m.product_code);

           await supabase.from('campaign_goals').upsert(metasCampaña, { onConflict: 'campaign_id, product_code' })
           alert(`✅ ¡Cargado! Ahora ves los ${metasCampaña.length} productos de esta campaña.`)
        } else {
           alert(`✅ Catálogo Global actualizado.`)
        }

        cargarTablaDinamica()
        setLoading(false)
        e.target.value = null
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="p-8 max-w-6xl mx-auto">
        <header className="flex flex-col gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black">
               {selectedCampana ? 'Productos de Campaña' : 'Maestro de Productos'}
            </h1>
            <p className="text-slate-500">
               {selectedCampana 
                 ? 'Viendo stock esperado para la campaña seleccionada.' 
                 : 'Viendo el catálogo global de la empresa.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid md:grid-cols-2 gap-6 items-end">
            
            <div className="w-full">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Filtrar / Cargar a:
              </label>
              <select 
                value={selectedCampana}
                onChange={(e) => setSelectedCampana(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">🌎 Ver Catálogo Global (Todos)</option>
                {campanas.map(c => (
                  <option key={c.id} value={c.id}>🎯 Campaña: {c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={descargarPlantilla} className="bg-white border-2 border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                📄 Plantilla
              </button>
              <label className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                <span>{loading ? '⏳' : '☁️'}</span> 
                {loading ? '...' : 'Subir Excel'}
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
              </label>
            </div>
          </div>
        </header>

        {/* TABLA DINÁMICA */}
        <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${selectedCampana ? 'border-blue-200 shadow-blue-100' : 'border-slate-200'}`}>
          <table className="w-full text-left border-collapse">
            <thead className={`text-[10px] font-bold uppercase tracking-widest border-b ${selectedCampana ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
              <tr>
                <th className="p-5">Código</th>
                <th className="p-5">Descripción</th>
                <th className="p-5 text-center">
                   {selectedCampana ? 'Stock' : 'Ref. Global'}
                </th>
                <th className="p-5">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {/* Aquí continúa el mapeo del listado de tus productos en la tabla... */}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
