import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'

export default async function VentaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: venta } = await supabase
    .from('ventas')
    .select('*, clientes(nombre), venta_items(*, productos(nombre, unidad))')
    .eq('id', id)
    .single()

  if (!venta) {
    notFound()
  }

  const subtotalBruto = venta.venta_items.reduce(
    (acc: number, item: { subtotal: number }) => acc + Number(item.subtotal),
    0
  )
  const total = subtotalBruto - Number(venta.descuento)

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Venta — {venta.clientes?.nombre}</h2>
          <div className="date">
            {venta.fecha} ·{' '}
            <span className={`badge ${venta.condicion_venta === 'contado' ? 'activo' : 'saldo'}`}>
              {venta.condicion_venta}
            </span>
            {venta.metodo_pago && <> · {venta.metodo_pago}</>}
          </div>
        </div>
        <Link href="/ventas" className="btn btn-ghost">
          Volver
        </Link>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Precio unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.venta_items.map((item: {
              id: string
              cantidad: number
              precio_unitario: number
              subtotal: number
              productos: { nombre: string; unidad: string } | null
            }) => (
              <tr key={item.id}>
                <td>{item.productos?.nombre}</td>
                <td className="mono-num">
                  {item.cantidad} {item.productos?.unidad}
                </td>
                <td className="mono-num">₲ {Number(item.precio_unitario).toLocaleString('es-PY')}</td>
                <td className="mono-num">₲ {Number(item.subtotal).toLocaleString('es-PY')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totales-box">
          <div className="trow">
            <span>Subtotal</span>
            <span className="mono-num">₲ {subtotalBruto.toLocaleString('es-PY')}</span>
          </div>
          <div className="trow">
            <span>Descuento</span>
            <span className="mono-num">₲ {Number(venta.descuento).toLocaleString('es-PY')}</span>
          </div>
          <div className="trow total">
            <span>Total</span>
            <span>₲ {total.toLocaleString('es-PY')}</span>
          </div>
        </div>

        {venta.observaciones && (
          <div style={{ marginTop: 16 }}>
            <p className="sub" style={{ marginBottom: 4 }}>Observaciones</p>
            <p>{venta.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  )
}
