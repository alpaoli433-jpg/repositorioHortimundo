'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CATEGORIAS = ['insumos', 'mantenimiento', 'servicios', 'impuestos', 'otros']

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoGastoForm() {
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('gastos').insert({
      categoria,
      monto: Number(monto),
      descripcion: descripcion || null,
      fecha,
    })

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setMonto('')
    setDescripcion('')
    setFecha(hoy())
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div className="field">
        <label>Categoría</label>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Monto</label>
        <input
          type="number"
          step="1"
          min="1"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
      </div>

      <div className="field" style={{ flex: 1 }}>
        <label>Descripción</label>
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="field">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      <button type="submit" className="btn btn-primary">
        Registrar
      </button>

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
