'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

type Variedad = { id: string; nombre: string; unidad: string }

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoMovimientoLechugaForm({ variedades }: { variedades: Variedad[] }) {
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada')
  const [variedadId, setVariedadId] = useState(variedades[0]?.id ?? '')
  const [cantidad, setCantidad] = useState<number | ''>('')
  const [fecha, setFecha] = useState(hoy())
  const [proveedor, setProveedor] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await conCargando(() =>
      supabase.from('lechuga_movimientos').insert({
        variedad_id: variedadId,
        tipo,
        cantidad: cantidad === '' ? 0 : cantidad,
        fecha,
        proveedor: tipo === 'entrada' ? proveedor || null : null,
        fecha_vencimiento: tipo === 'entrada' ? fechaVencimiento || null : null,
      })
    )

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setCantidad('')
    setProveedor('')
    setFechaVencimiento('')
    setFecha(hoy())
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div className="field">
        <label>Tipo</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as 'entrada' | 'salida')}>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
      </div>

      <div className="field" style={{ flex: 1 }}>
        <label>Variedad</label>
        <select value={variedadId} onChange={(e) => setVariedadId(e.target.value)} required>
          {variedades.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
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

      {tipo === 'entrada' && (
        <>
          <div className="field">
            <label>Proveedor</label>
            <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Opcional" />
          </div>

          <div className="field">
            <label>Vencimiento</label>
            <input
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>
        </>
      )}

      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? 'Registrando…' : 'Registrar'}
      </button>

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
