import { createClient } from '@/lib/supabase/server'

export default async function StockPage() {
  const supabase = await createClient()

  const { data: stock, error } = await supabase
    .from('stock')
    .select('*')
    .order('nombre')

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Stock</h2>
          <div className="date">Disponible por producto, calculado a partir de mercadería</div>
        </div>
      </div>

      <div className="card">
        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar stock: {error.message}</p>}

        {stock && stock.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidad</th>
                <th>Disponible</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((s) => (
                <tr key={s.producto_id}>
                  <td>{s.nombre}</td>
                  <td>{s.unidad}</td>
                  <td>
                    {s.cantidad_disponible <= 0 ? (
                      <span className="badge inactivo">Sin stock</span>
                    ) : (
                      <span className="mono-num">{s.cantidad_disponible}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {stock?.length === 0 && <p className="sub">Todavía no hay productos cargados.</p>}
      </div>
    </div>
  )
}
