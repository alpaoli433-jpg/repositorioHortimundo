'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Producto = { id: string; nombre: string; unidad: string }

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoMovimientoForm({ productos }: { productos: Producto[] }) {
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada')
  const [productoId, setProductoId] = useState(productos[0]?.id ?? '')
  const [cantidad, setCantidad] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [proveedor, setProveedor] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('mercaderia_movimientos').insert({
      producto_id: productoId,
      tipo,
      cantidad: Number(cantidad),
      fecha,
      proveedor: tipo === 'entrada' ? proveedor || null : null,
    })

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setCantidad('')
    setProveedor('')
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
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      {tipo === 'entrada' && (
        <div className="field">
          <label>Proveedor</label>
          <input
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            placeholder="Opcional"
          />
        </div>
      )}

      <button type="submit" className="btn btn-primary">
        Registrar
      </button>

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
