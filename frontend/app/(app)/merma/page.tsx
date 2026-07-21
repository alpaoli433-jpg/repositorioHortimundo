import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NuevaMermaForm from './nueva-merma-form'

export default async function MermaPage() {
  const supabase = await createClient()

  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, unidad')
    .order('nombre')

  const { data: mermas, error } = await supabase
    .from('merma')
    .select('*, productos(nombre, unidad)')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Merma</h2>
          <div className="date">Pérdidas de mercadería</div>
        </div>
      </div>

      <div className="card">
        <h3>Registrar merma</h3>
        <div className="sub">Producto perdido o descartado</div>

        {productos && productos.length > 0 ? (
          <NuevaMermaForm productos={productos} />
        ) : (
          <p className="sub">
            Todavía no hay productos cargados. <Link href="/productos">Cargá productos primero</Link>.
          </p>
        )}
      </div>

      <div className="card">
        <h3>Historial reciente</h3>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar merma: {error.message}</p>}

        {mermas && mermas.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {mermas.map((m) => (
                <tr key={m.id}>
                  <td>{m.fecha}</td>
                  <td>{m.productos?.nombre}</td>
                  <td className="mono-num">
                    {m.cantidad} {m.productos?.unidad}
                  </td>
                  <td>{m.motivo ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {mermas?.length === 0 && <p className="sub">Todavía no hay merma registrada.</p>}
      </div>
    </div>
  )
}
