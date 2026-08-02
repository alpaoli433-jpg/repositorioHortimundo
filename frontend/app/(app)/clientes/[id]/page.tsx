import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import DatosCliente from './datos-cliente'

export default async function ClienteFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (!cliente) {
    notFound()
  }

  const { data: ventas, error: errorVentas } = await supabase
    .from('ventas')
    .select('*, venta_items(subtotal)')
    .eq('cliente_id', id)
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })

  const ventasConTotal = (ventas ?? []).map((venta) => {
    const subtotalBruto = venta.venta_items.reduce(
      (acc: number, item: { subtotal: number }) => acc + Number(item.subtotal),
      0
    )
    return { ...venta, total: subtotalBruto - Number(venta.descuento) }
  })

  const totalFacturado = ventasConTotal.reduce((acc, v) => acc + v.total, 0)
  const cantidadCompras = ventasConTotal.length
  const ultimaCompra = ventasConTotal[0]?.fecha ?? null

  const { data: productoTop } = await supabase
    .from('cliente_producto_resumen')
    .select('producto_nombre, unidad, cantidad_total')
    .eq('cliente_id', id)
    .order('cantidad_total', { ascending: false })
    .order('producto_nombre', { ascending: true })
    .limit(1)
    .maybeSingle()

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>{cliente.nombre}</h2>
          <div className="date">
            <span className={`badge ${cliente.estado === 'activo' ? 'activo' : 'inactivo'}`}>
              {cliente.estado}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href={`/clientes/${cliente.id}/imprimir`} className="btn btn-ghost">
            Imprimir ficha
          </Link>
          <Link href="/clientes" className="btn btn-ghost">
            Volver
          </Link>
        </div>
      </div>

      <DatosCliente cliente={cliente} />

      <div className="kpi-row">
        <div className="kpi">
          <div className="label">Total facturado histórico</div>
          <div className="value">
            {cantidadCompras > 0 ? `₲ ${totalFacturado.toLocaleString('es-PY')}` : '—'}
          </div>
        </div>
        <div className="kpi">
          <div className="label">Cantidad de compras</div>
          <div className="value">{cantidadCompras}</div>
        </div>
        <div className="kpi">
          <div className="label">Última compra</div>
          <div className="value">{ultimaCompra ?? '—'}</div>
        </div>
        <div className="kpi">
          <div className="label">Producto más comprado</div>
          <div className="value">
            {productoTop ? `${productoTop.producto_nombre}` : '—'}
          </div>
          {productoTop && (
            <div className="sub" style={{ marginTop: 4 }}>
              {productoTop.cantidad_total} {productoTop.unidad}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Historial de compras</h3>

        {errorVentas && (
          <p style={{ color: 'var(--brick)' }}>Error al cargar el historial: {errorVentas.message}</p>
        )}

        {ventasConTotal.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Condición</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventasConTotal.map((venta) => (
                <tr key={venta.id}>
                  <td>{venta.fecha}</td>
                  <td>
                    <span className={`badge ${venta.condicion_venta === 'contado' ? 'activo' : 'saldo'}`}>
                      {venta.condicion_venta}
                    </span>
                  </td>
                  <td className="mono-num">₲ {venta.total.toLocaleString('es-PY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {ventasConTotal.length === 0 && <p className="sub">Todavía no hay compras registradas.</p>}
      </div>
    </div>
  )
}
