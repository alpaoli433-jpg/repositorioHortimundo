'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

const CATEGORIAS = ['insumos', 'mantenimiento', 'servicios', 'impuestos', 'otros']

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoGastoForm() {
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [monto, setMonto] = useState<number | ''>('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await conCargando(() =>
      supabase.from('gastos').insert({
        categoria,
        monto: monto === '' ? 0 : monto,
        descripcion: descripcion || null,
        fecha,
      })
    )

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
        <NumeroInput value={monto} onChange={setMonto} required />
      </div>

      <div className="field" style={{ flex: 1 }}>
        <label>Descripción</label>
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="field">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? 'Registrando…' : 'Registrar'}
      </button>

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
