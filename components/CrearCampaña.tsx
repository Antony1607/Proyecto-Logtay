'use client'
import { useState } from 'react'
// Corregimos la ruta para que use la carpeta lib de tu raíz
import { supabase } from '../lib/supabase' 

export default function CrearCampana() {
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('Cargando...')

    // Ajustado a la tabla 'camping' según el diagrama de tu amigo
    const { error } = await supabase
      .from('camping') 
      .insert([
        { 
          name: nombre, 
          status: 'activa' 
        }
      ])

    if (error) {
      setMensaje('Error: ' + error.message)
      console.error('Detalle del error:', error)
    } else {
      setMensaje('✅ Campaña creada con éxito')
      setNombre('')
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto mt-10 text-slate-900 border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Crear Nueva Campaña</h2>
      
      <form onSubmit={handleCrear} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre de la Campaña
          </label>
          <input 
            type="text" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="block w-full rounded-md border border-slate-300 p-2.5 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej: Inventario Almacén Central"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
        >
          Guardar Campaña
        </button>
      </form>

      {mensaje && (
        <div className={`mt-4 p-3 rounded text-center text-sm font-medium ${
          mensaje.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {mensaje}
        </div>
      )}
    </div>
  )
}