'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

type Producto = { id: string; nombre: string; unidad: string }
type Tipo = 'entrada' | 'salida' | 'ajuste'

export type Movimiento = {
  id: string
  producto_id: string
  tipo: Tipo
  cantidad: number
  fecha: string
  hora: string | null
  proveedor: string | null
  motivo: string | null
  observaciones: string | null
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoMovimientoForm({
  productos,
  registroExistente,
  onGuardado,
}: {
  productos: Producto[]
  registroExistente?: Movimiento
  onGuardado?: () => void
}) {
  const [tipo, setTipo] = useState<Tipo>(registroExistente?.tipo ?? 'entrada')
  const [productoId, setProductoId] = useState(registroExistente?.producto_id ?? productos[0]?.id ?? '')
  const [cantidad, setCantidad] = useState<number | ''>(registroExistente?.cantidad ?? '')
  const [fecha, setFecha] = useState(registroExistente?.fecha ?? hoy())
  const [hora, setHora] = useState(registroExistente?.hora ?? '')
  const [proveedor, setProveedor] = useState(registroExistente?.proveedor ?? '')
  const [motivo, setMotivo] = useState(registroExistente?.motivo ?? '')
  const [observaciones, setObservaciones] = useState(registroExistente?.observaciones ?? '')
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()
  const editando = Boolean(registroExistente)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const datos = {
      producto_id: productoId,
      tipo,
      cantidad: cantidad === '' ? 0 : cantidad,
      fecha,
      hora: hora || null,
      proveedor: tipo === 'entrada' ? proveedor || null : null,
      motivo: tipo === 'ajuste' ? motivo || null : null,
      observaciones: observaciones || null,
    }

    const { error } = await conCargando(() =>
      editando
        ? supabase.from('mercaderia_movimientos').update(datos).eq('id', registroExistente!.id)
        : supabase.from('mercaderia_movimientos').insert(datos)
    )

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    if (editando) {
      onGuardado?.()
      router.refresh()
      return
    }

    setCantidad('')
    setProveedor('')
    setMotivo('')
    setObservaciones('')
    setFecha(hoy())
    setHora('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div className="field">
        <label>Tipo</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
          <option value="ajuste">Ajuste</option>
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
        <label>{tipo === 'ajuste' ? 'Cantidad (+/-)' : 'Cantidad'}</label>
        <NumeroInput
          value={cantidad}
          onChange={setCantidad}
          decimales={2}
          permitirNegativos={tipo === 'ajuste'}
          required
        />
      </div>

      <div className="field">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      <div className="field">
        <label>Hora</label>
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} placeholder="Opcional" />
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

      {tipo === 'ajuste' && (
        <div className="field" style={{ flex: 1 }}>
          <label>Motivo</label>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: conteo físico, producto dañado"
            required
          />
        </div>
      )}

      <div className="field" style={{ flex: 1 }}>
        <label>Observaciones</label>
        <input
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Opcional"
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? (editando ? 'Guardando…' : 'Registrando…') : editando ? 'Guardar cambios' : 'Registrar'}
      </button>

      {editando && (
        <button type="button" className="btn btn-ghost" onClick={onGuardado}>
          Cancelar
        </button>
      )}

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
