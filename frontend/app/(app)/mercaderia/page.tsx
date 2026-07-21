import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NuevoMovimientoForm from './nuevo-movimiento-form'

export default async function MercaderiaPage() {
  const supabase = await createClient()

  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, unidad')
    .order('nombre')

  const { data: movimientos, error } = await supabase
    .from('mercaderia_movimientos')
    .select('*, productos(nombre, unidad)')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Mercadería</h2>
          <div className="date">Entradas y salidas de mercadería</div>
        </div>
      </div>

      <div className="card">
        <h3>Registrar movimiento</h3>
        <div className="sub">Entrada o salida de un producto del catálogo</div>

        {productos && productos.length > 0 ? (
          <NuevoMovimientoForm productos={productos} />
        ) : (
          <p className="sub">
            Todavía no hay productos cargados. <Link href="/productos">Cargá productos primero</Link>.
          </p>
        )}
      </div>

      <div className="card">
        <h3>Historial reciente</h3>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar movimientos: {error.message}</p>}

        {movimientos && movimientos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td>{m.fecha}</td>
                  <td>{m.productos?.nombre}</td>
                  <td>
                    <span className={`badge ${m.tipo === 'entrada' ? 'activo' : 'saldo'}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="mono-num">
                    {m.cantidad} {m.productos?.unidad}
                  </td>
                  <td>{m.proveedor ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {movimientos?.length === 0 && <p className="sub">Todavía no hay movimientos registrados.</p>}
      </div>
    </div>
  )
}
