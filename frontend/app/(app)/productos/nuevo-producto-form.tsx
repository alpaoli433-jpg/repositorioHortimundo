'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCargando } from '@/lib/use-cargando'

const UNIDADES = ['kg', 'unidad', 'atado', 'docena', 'cajón']

export default function NuevoProductoForm() {
  const [nombre, setNombre] = useState('')
  const [unidad, setUnidad] = useState(UNIDADES[0])
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await conCargando(() =>
      supabase.from('productos').insert({
        nombre,
        unidad,
      })
    )

    if (error) {
      if (error.code === '23505') {
        setError('Ya existe un producto con ese nombre.')
      } else {
        setError('No se pudo guardar: ' + error.message)
      }
      return
    }

    setNombre('')
    setUnidad(UNIDADES[0])
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
      <div className="field" style={{ flex: 2 }}>
        <label>Nombre del producto</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div className="field" style={{ flex: 1 }}>
        <label>Unidad</label>
        <select value={unidad} onChange={(e) => setUnidad(e.target.value)}>
          {UNIDADES.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? 'Agregando…' : 'Agregar'}
      </button>
      {error && <p style={{ color: 'var(--brick)', marginLeft: 8 }}>{error}</p>}
    </form>
  )
}
