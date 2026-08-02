import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import VistaPreviaButton from './vista-previa-button'

export default async function FacturacionPage() {
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: ventas, error } = await supabase
    .from('ventas')
    .select('*, clientes(nombre), venta_items(subtotal)')
    .eq('condicion_venta', 'contado')
    .order('fecha', { ascending: false })
    .limit(50)

  const { data: facturas } = await supabase.from('facturas_electronicas').select('venta_id')

  const idsFacturados = new Set((facturas ?? []).map((f) => f.venta_id))
  const pendientes = (ventas ?? []).filter((v) => !idsFacturados.has(v.id))

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Facturación</h2>
          <div className="date">
            Base para la integración con BillPy — todavía sin conexión real a la API
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Ventas sin factura</h3>
        <div className="sub">
          Solo ventas de contado (crédito queda pendiente). &ldquo;Vista previa del envío&rdquo; arma el
          JSON que se enviaría a BillPy, sin emitir nada todavía.
        </div>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar ventas: {error.message}</p>}

        {pendientes.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((v) => {
                const subtotalBruto = v.venta_items.reduce(
                  (acc: number, item: { subtotal: number }) => acc + Number(item.subtotal),
                  0
                )
                const total = subtotalBruto - Number(v.descuento)

                return (
                  <tr key={v.id}>
                    <td>{v.fecha}</td>
                    <td>{v.clientes?.nombre}</td>
                    <td className="mono-num">₲ {total.toLocaleString('es-PY')}</td>
                    <td>
                      <VistaPreviaButton ventaId={v.id} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {pendientes.length === 0 && <p className="sub">No hay ventas de contado pendientes de factura.</p>}
      </div>
    </div>
  )
}
