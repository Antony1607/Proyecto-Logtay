'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SeleccionarEmpresa() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    cargarEmpresas()
  }, [])

  const cargarEmpresas = async () => {
    // Traemos solo ID y Nombre para el menú
    const { data } = await supabase.from('companies').select('id, name').order('name')
    setEmpresas(data || [])
    setLoading(false)
  }

  const unirseAEmpresa = async (companyId: string, companyName: string) => {
    if(!confirm(`¿Confirmas que trabajas para ${companyName}?`)) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // VINCULACIÓN MÁGICA: Actualizamos al usuario
    const { error } = await supabase
      .from('users')
      .update({ company_id: companyId })
      .eq('id', user.id)

    if (error) {
      alert('Error al unirte: ' + error.message)
    } else {
      // ¡ÉXITO! Lo mandamos al Dashboard y la próxima vez no verá esto
      router.push('/')
    }
  }

  if (loading) return <div className="p-10 text-center">Cargando empresas...</div>

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Bienvenido a Logtay</h1>
        <p className="text-slate-500 mb-6">Para continuar, selecciona la empresa a la que perteneces:</p>

        <div className="space-y-3">
          {empresas.map((emp) => (
            <button
              key={emp.id}
              onClick={() => unirseAEmpresa(emp.id, emp.name)}
              className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 group-hover:text-blue-700">{emp.name}</span>
                <span className="text-slate-300 group-hover:text-blue-500">➜</span>
              </div>
            </button>
          ))}
        </div>
        
        {empresas.length === 0 && (
            <p className="text-red-500 text-sm mt-4">No hay empresas registradas en el sistema.</p>
        )}
      </div>
    </div>
  )
}