import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import ImprimirButton from '@/components/imprimir-button'

const LIMITE_HISTORIAL = 10

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default async function ClienteImprimirPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: ventas } = await supabase
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
  const ventasImpresas = ventasConTotal.slice(0, LIMITE_HISTORIAL)

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
      <div className="topbar no-print">
        <div>
          <h2>Ficha de cliente</h2>
          <div className="date">Lista para imprimir</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href={`/clientes/${cliente.id}`} className="btn btn-ghost">
            Volver
          </Link>
          <ImprimirButton />
        </div>
      </div>

      <div className="doc-preview">
        <h4>HortiMundo</h4>
        <div className="doc-sub">Ficha de cliente — {cliente.nombre} · Emitida el {hoy()}</div>

        <h5>Datos del cliente</h5>
        <div className="doc-row">
          <span>RUC</span>
          <span>{cliente.ruc ?? '—'}</span>
        </div>
        <div className="doc-row">
          <span>Teléfono</span>
          <span>{cliente.telefono ?? '—'}</span>
        </div>
        <div className="doc-row">
          <span>Dirección</span>
          <span>{cliente.direccion ?? '—'}</span>
        </div>
        <div className="doc-row">
          <span>Correo</span>
          <span>{cliente.correo ?? '—'}</span>
        </div>
        <div className="doc-row">
          <span>Estado</span>
          <span>{cliente.estado}</span>
        </div>
        <div className="doc-row">
          <span>Observaciones</span>
          <span>{cliente.observaciones ?? '—'}</span>
        </div>

        <h5 style={{ marginTop: 18 }}>Estadísticas</h5>
        <div className="doc-row">
          <span>Total facturado histórico</span>
          <span className="mono-num">
            {cantidadCompras > 0 ? `₲ ${totalFacturado.toLocaleString('es-PY')}` : '—'}
          </span>
        </div>
        <div className="doc-row">
          <span>Cantidad de compras</span>
          <span className="mono-num">{cantidadCompras}</span>
        </div>
        <div className="doc-row">
          <span>Última compra</span>
          <span>{ultimaCompra ?? '—'}</span>
        </div>
        <div className="doc-row">
          <span>Producto más comprado</span>
          <span>
            {productoTop ? `${productoTop.producto_nombre} (${productoTop.cantidad_total} ${productoTop.unidad})` : '—'}
          </span>
        </div>

        <h5 style={{ marginTop: 18 }}>Historial de compras</h5>
        {ventasImpresas.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Condición</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventasImpresas.map((venta) => (
                <tr key={venta.id}>
                  <td>{venta.fecha}</td>
                  <td>{venta.condicion_venta}</td>
                  <td className="mono-num">₲ {venta.total.toLocaleString('es-PY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="sub">Todavía no hay compras registradas.</p>
        )}

        {cantidadCompras > LIMITE_HISTORIAL && (
          <p className="sub" style={{ marginTop: 8 }}>
            Mostrando las {LIMITE_HISTORIAL} compras más recientes de un total de {cantidadCompras}. Ver
            historial completo en el sistema.
          </p>
        )}
      </div>
    </div>
  )
}
