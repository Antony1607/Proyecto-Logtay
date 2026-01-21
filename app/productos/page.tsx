'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import Papa from 'papaparse' // Librería para leer el CSV

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)

  useEffect(() => {
    obtenerDatosIniciales()
  }, [])

  const obtenerDatosIniciales = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase.from('users').select('company_id').eq('id', user.id).single()
    if (userData) {
      setCompanyId(userData.company_id)
      cargarListaProductos(userData.company_id)
    }
  }

  const cargarListaProductos = async (cId: string) => {
    const { data } = await supabase.from('products').select('*').eq('company_id', cId).order('name', { ascending: true })
    setProductos(data || [])
  }

  // FUNCIÓN MÁGICA: IMPORTAR CSV
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file || !companyId) return

    setLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const nuevosProductos = results.data.map((row: any) => ({
          product_code: row.codigo || row.SKU,
          name: row.nombre || row.producto,
          category: row.categoria || 'General',
          company_id: companyId
        }))

        const { error } = await supabase.from('products').insert(nuevosProductos)
        
        if (error) {
          alert("Error al subir: " + error.message)
        } else {
          alert(`✅ ¡Éxito! Se cargaron ${nuevosProductos.length} productos.`)
          cargarListaProductos(companyId)
        }
        setLoading(false)
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="p-8 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black">Maestro de Productos</h1>
            <p className="text-slate-500">Sube tu inventario para que el equipo móvil pueda escanearlo.</p>
          </div>
          
          <label className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-all shadow-lg">
            {loading ? 'Subiendo...' : '＋ IMPORTAR CSV'}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
          </label>
        </header>

        {/* Tabla de visualización */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b">
              <tr>
                <th className="p-5">Código (SKU)</th>
                <th className="p-5">Nombre</th>
                <th className="p-5">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-mono text-blue-600 font-bold">{p.product_code}</td>
                  <td className="p-5 font-medium">{p.name}</td>
                  <td className="p-5 text-slate-500 text-sm">{p.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}