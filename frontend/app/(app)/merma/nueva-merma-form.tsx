'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

type Producto = { id: string; nombre: string; unidad: string }

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevaMermaForm({ productos }: { productos: Producto[] }) {
  const [productoId, setProductoId] = useState(productos[0]?.id ?? '')
  const [cantidad, setCantidad] = useState<number | ''>('')
  const [fecha, setFecha] = useState(hoy())
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await conCargando(() =>
      supabase.from('merma').insert({
        producto_id: productoId,
        cantidad: cantidad === '' ? 0 : cantidad,
        fecha,
        motivo: motivo || null,
      })
    )

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setCantidad('')
    setMotivo('')
    setFecha(hoy())
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div className="field" style={{ flex: 1 }}>
        <label>Producto</label>
        <select value={productoId} onChange={(e) => setProductoId(e.target.value)} required>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Cantidad</label>
        <NumeroInput value={cantidad} onChange={setCantidad} decimales={2} required />
      </div>

      <div className="field">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      <div className="field" style={{ flex: 1 }}>
        <label>Motivo</label>
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Opcional" />
      </div>

      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? 'Registrando…' : 'Registrar'}
      </button>

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
