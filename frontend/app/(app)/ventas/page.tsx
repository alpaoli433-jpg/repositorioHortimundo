import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import NuevaVentaForm from './nueva-venta-form'
import FilaVenta from './fila-venta'

export default async function VentasPage() {
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre')
    .eq('estado', 'activo')
    .order('nombre')

  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, unidad')
    .order('nombre')

  const { data: ventas, error } = await supabase
    .from('ventas')
    .select('*, clientes(nombre), venta_items(producto_id, cantidad, precio_unitario, subtotal), facturas_electronicas(estado)')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Cargar venta</h2>
          <div className="date">Registrá una operación comercial completa</div>
        </div>
      </div>

      <div className="card">
        <h3>Nueva venta</h3>
        {clientes && clientes.length > 0 && productos && productos.length > 0 ? (
          <NuevaVentaForm clientes={clientes} productos={productos} />
        ) : (
          <p className="sub">
            Hace falta al menos un cliente activo y un producto cargado para registrar una venta.
          </p>
        )}
      </div>

      <div className="card">
        <h3>Historial reciente</h3>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar ventas: {error.message}</p>}

        {ventas && ventas.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Condición</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <FilaVenta key={v.id} venta={v} clientes={clientes ?? []} productos={productos ?? []} />
              ))}
            </tbody>
          </table>
        )}

        {ventas?.length === 0 && <p className="sub">Todavía no hay ventas registradas.</p>}
      </div>
    </div>
  )
}
