import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import NuevoProductoForm from './nuevo-producto-form'

export default async function ProductosPage() {
  const supabase = await createClient()
  const { rol } = await getPerfilActual()

  const { data: productos, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre')

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Productos</h2>
          <div className="date">Catálogo de productos de HortiMundo</div>
        </div>
      </div>

      {rol === 'propietario' && (
        <div className="card">
          <h3>Nuevo producto</h3>
          <div className="sub">Se agrega al catálogo general</div>
          <NuevoProductoForm />
        </div>
      )}

      <div className="card">
        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar productos: {error.message}</p>}

        {productos && productos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidad</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td className="mono-num">{producto.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {productos?.length === 0 && <p className="sub">Todavía no hay productos cargados.</p>}
      </div>
    </div>
  )
}
