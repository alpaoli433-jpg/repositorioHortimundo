import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import NuevoMovimientoForm from './nuevo-movimiento-form'
import FilaMovimiento from './fila-movimiento'

export default async function MercaderiaPage() {
  const { rol } = await getPerfilActual()
  const puedeEditar = rol === 'propietario'
  const supabase = await createClient()

  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, unidad')
    .order('nombre')

  const { data: movimientos, error } = await supabase
    .from('mercaderia_movimientos')
    .select('*, productos(nombre, unidad)')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false, nullsFirst: false })
    .order('creado_en', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Mercadería</h2>
          <div className="date">Entradas, salidas y ajustes de mercadería</div>
        </div>
      </div>

      <div className="card">
        <h3>Registrar movimiento</h3>
        <div className="sub">
          Entrada, salida, o ajuste manual del stock (solo propietario) de un producto del catálogo
        </div>

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
                <th>Hora</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Proveedor / Motivo</th>
                <th>Observaciones</th>
                {puedeEditar && <th></th>}
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <FilaMovimiento
                  key={m.id}
                  movimiento={m}
                  productos={productos ?? []}
                  puedeEditar={puedeEditar}
                />
              ))}
            </tbody>
          </table>
        )}

        {movimientos?.length === 0 && <p className="sub">Todavía no hay movimientos registrados.</p>}
      </div>
    </div>
  )
}
