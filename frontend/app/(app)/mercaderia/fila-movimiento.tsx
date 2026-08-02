'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import EliminarButton from '@/components/eliminar-button'
import NuevoMovimientoForm, { type Movimiento } from './nuevo-movimiento-form'

type Producto = { id: string; nombre: string; unidad: string }
type MovimientoConProducto = Movimiento & { productos: { nombre: string; unidad: string } | null }

export default function FilaMovimiento({
  movimiento,
  productos,
  puedeEditar,
}: {
  movimiento: MovimientoConProducto
  productos: Producto[]
  puedeEditar: boolean
}) {
  const [editando, setEditando] = useState(false)

  if (editando) {
    return (
      <tr>
        <td colSpan={puedeEditar ? 8 : 7}>
          <NuevoMovimientoForm
            productos={productos}
            registroExistente={movimiento}
            onGuardado={() => setEditando(false)}
          />
        </td>
      </tr>
    )
  }

  const badgeClase =
    movimiento.tipo === 'entrada' ? 'activo' : movimiento.tipo === 'salida' ? 'saldo' : 'inactivo'

  return (
    <tr>
      <td>{movimiento.fecha}</td>
      <td>{movimiento.hora ? movimiento.hora.slice(0, 5) : '—'}</td>
      <td>{movimiento.productos?.nombre}</td>
      <td>
        <span className={`badge ${badgeClase}`}>{movimiento.tipo}</span>
      </td>
      <td className="mono-num">
        {movimiento.cantidad} {movimiento.productos?.unidad}
      </td>
      <td>{movimiento.tipo === 'ajuste' ? movimiento.motivo : (movimiento.proveedor ?? '—')}</td>
      <td>{movimiento.observaciones ?? '—'}</td>
      {puedeEditar && (
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditando(true)}>
              Editar
            </button>
            <EliminarButton
              confirmacion="¿Eliminar este movimiento? Afecta el cálculo de stock."
              onEliminar={async () => {
                const supabase = createClient()
                return supabase.from('mercaderia_movimientos').delete().eq('id', movimiento.id)
              }}
            />
          </div>
        </td>
      )}
    </tr>
  )
}
