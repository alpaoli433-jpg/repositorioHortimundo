'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

type Cliente = { id: string; nombre: string }
type Producto = { id: string; nombre: string; unidad: string }
type Item = { producto_id: string; cantidad: number | ''; precio_unitario: number | '' }

export type Venta = {
  id: string
  cliente_id: string
  fecha: string
  condicion_venta: 'contado' | 'credito'
  metodo_pago: string
  descuento: number
  observaciones: string | null
  venta_items: { producto_id: string; cantidad: number; precio_unitario: number }[]
}

const METODOS_PAGO = ['efectivo', 'transferencia', 'cheque']

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function itemVacio(productoId: string): Item {
  return { producto_id: productoId, cantidad: '', precio_unitario: '' }
}

export default function NuevaVentaForm({
  clientes,
  productos,
  registroExistente,
  onGuardado,
}: {
  clientes: Cliente[]
  productos: Producto[]
  registroExistente?: Venta
  onGuardado?: () => void
}) {
  const [clienteId, setClienteId] = useState(registroExistente?.cliente_id ?? clientes[0]?.id ?? '')
  const [fecha, setFecha] = useState(registroExistente?.fecha ?? hoy())
  const [condicionVenta, setCondicionVenta] = useState<'contado' | 'credito'>(
    registroExistente?.condicion_venta ?? 'contado'
  )
  const [metodoPago, setMetodoPago] = useState(registroExistente?.metodo_pago ?? METODOS_PAGO[0])
  const [descuento, setDescuento] = useState<number | ''>(registroExistente?.descuento ?? 0)
  const [observaciones, setObservaciones] = useState(registroExistente?.observaciones ?? '')
  const [items, setItems] = useState<Item[]>(
    registroExistente?.venta_items.length
      ? registroExistente.venta_items.map((it) => ({ ...it }))
      : [itemVacio(productos[0]?.id ?? '')]
  )
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()
  const editando = Boolean(registroExistente)

  function actualizarItem(index: number, cambios: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...cambios } : it)))
  }

  function agregarItem() {
    setItems((prev) => [...prev, itemVacio(productos[0]?.id ?? '')])
  }

  function quitarItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const subtotalBruto = items.reduce((acc, it) => acc + (it.cantidad || 0) * (it.precio_unitario || 0), 0)
  const total = subtotalBruto - (descuento || 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const itemsPayload = items.map((it) => ({
      producto_id: it.producto_id,
      cantidad: it.cantidad === '' ? 0 : it.cantidad,
      precio_unitario: it.precio_unitario === '' ? 0 : it.precio_unitario,
    }))

    if (editando) {
      const { error } = await conCargando(() =>
        supabase.rpc('fn_editar_venta', {
          p_venta_id: registroExistente!.id,
          p_cliente_id: clienteId,
          p_fecha: fecha,
          p_condicion_venta: condicionVenta,
          p_metodo_pago: metodoPago,
          p_descuento: descuento === '' ? 0 : descuento,
          p_observaciones: observaciones || null,
          p_items: itemsPayload,
        })
      )

      if (error) {
        setError(error.message)
        return
      }

      onGuardado?.()
      router.refresh()
      return
    }

    const { error } = await conCargando(() =>
      supabase.rpc('fn_registrar_venta', {
        p_cliente_id: clienteId,
        p_fecha: fecha,
        p_condicion_venta: condicionVenta,
        p_metodo_pago: metodoPago,
        p_descuento: descuento === '' ? 0 : descuento,
        p_observaciones: observaciones || null,
        p_items: itemsPayload,
      })
    )

    if (error) {
      setError('No se pudo registrar la venta: ' + error.message)
      return
    }

    setFecha(hoy())
    setCondicionVenta('contado')
    setMetodoPago(METODOS_PAGO[0])
    setDescuento(0)
    setObservaciones('')
    setItems([itemVacio(productos[0]?.id ?? '')])
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="venta-form">
        <div className="field">
          <label>Cliente</label>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>

        <div className="field">
          <label>Condición de venta</label>
          <select
            value={condicionVenta}
            onChange={(e) => setCondicionVenta(e.target.value as 'contado' | 'credito')}
          >
            <option value="contado">Contado</option>
            <option value="credito">Crédito</option>
          </select>
        </div>

        <div className="field">
          <label>Método de pago</label>
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
            {METODOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio unit.</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const subtotalFila = (item.cantidad || 0) * (item.precio_unitario || 0)
            const unidad = productos.find((p) => p.id === item.producto_id)?.unidad
            return (
              <tr key={index}>
                <td>
                  <select
                    value={item.producto_id}
                    onChange={(e) => actualizarItem(index, { producto_id: e.target.value })}
                    required
                  >
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <NumeroInput
                    value={item.cantidad}
                    onChange={(cantidad) => actualizarItem(index, { cantidad })}
                    decimales={2}
                    suffix={unidad ? ` ${unidad}` : ''}
                    required
                  />
                </td>
                <td>
                  <NumeroInput
                    value={item.precio_unitario}
                    onChange={(precio_unitario) => actualizarItem(index, { precio_unitario })}
                    prefix="₲ "
                    required
                  />
                </td>
                <td className="mono-num">₲ {subtotalFila.toLocaleString('es-PY')}</td>
                <td>
                  {items.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => quitarItem(index)}>
                      Quitar
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <button type="button" className="add-row" onClick={agregarItem}>
        ＋ Agregar producto
      </button>

      <div className="totales-box">
        <div className="trow">
          <span>Subtotal</span>
          <span className="mono-num">₲ {subtotalBruto.toLocaleString('es-PY')}</span>
        </div>
        <div className="trow">
          <span>Descuento</span>
          <NumeroInput value={descuento} onChange={setDescuento} style={{ width: 120, textAlign: 'right' }} />
        </div>
        <div className="trow total">
          <span>Total</span>
          <span>₲ {total.toLocaleString('es-PY')}</span>
        </div>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label>Observaciones</label>
        <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Opcional" />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button type="submit" className="btn btn-dark" disabled={cargando}>
          {cargando ? (editando ? 'Guardando…' : 'Registrando…') : editando ? 'Guardar cambios' : 'Registrar venta'}
        </button>
        {editando && (
          <button type="button" className="btn btn-ghost" onClick={onGuardado}>
            Cancelar
          </button>
        )}
      </div>

      {error && <p style={{ color: 'var(--brick)', marginTop: 10 }}>{error}</p>}
    </form>
  )
}
