'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import EliminarButton from '@/components/eliminar-button'
import NuevaVentaForm, { type Venta } from './nueva-venta-form'

type Cliente = { id: string; nombre: string }
type Producto = { id: string; nombre: string; unidad: string }

type VentaConDetalle = Omit<Venta, 'venta_items'> & {
  clientes: { nombre: string } | null
  venta_items: (Venta['venta_items'][number] & { subtotal: number })[]
  facturas_electronicas: { estado: string }[]
}

export default function FilaVenta({
  venta,
  clientes,
  productos,
}: {
  venta: VentaConDetalle
  clientes: Cliente[]
  productos: Producto[]
}) {
  const [editando, setEditando] = useState(false)

  const facturada = venta.facturas_electronicas.some((f) => f.estado !== 'pendiente')
  const subtotalBruto = venta.venta_items.reduce((acc, item) => acc + Number(item.subtotal), 0)
  const total = subtotalBruto - Number(venta.descuento)

  if (editando) {
    return (
      <tr>
        <td colSpan={5}>
          <NuevaVentaForm
            clientes={clientes}
            productos={productos}
            registroExistente={venta}
            onGuardado={() => setEditando(false)}
          />
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>{venta.fecha}</td>
      <td>{venta.clientes?.nombre}</td>
      <td>
        <span className={`badge ${venta.condicion_venta === 'contado' ? 'activo' : 'saldo'}`}>
          {venta.condicion_venta}
        </span>
      </td>
      <td className="mono-num">₲ {total.toLocaleString('es-PY')}</td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href={`/ventas/${venta.id}`} className="btn btn-ghost btn-sm">
            Ver detalle
          </Link>
          {facturada ? (
            <span className="badge inactivo">Facturada</span>
          ) : (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditando(true)}>
                Editar
              </button>
              <EliminarButton
                mensajeCrudo
                confirmacion="¿Eliminar esta venta? Se revertirá el stock de los productos vendidos de forma inmediata. Esta acción no se puede deshacer."
                onEliminar={async () => {
                  const supabase = createClient()
                  const { error } = await supabase.rpc('fn_eliminar_venta', { p_venta_id: venta.id })
                  return { error }
                }}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
