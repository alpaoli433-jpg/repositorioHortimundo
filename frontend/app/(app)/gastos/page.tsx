import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import NuevoGastoForm from './nuevo-gasto-form'

export default async function GastosPage() {
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: gastos, error } = await supabase
    .from('gastos')
    .select('*')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(50)

  const total = gastos?.reduce((acc, g) => acc + Number(g.monto), 0) ?? 0

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Gastos</h2>
          <div className="date">Incluye los gastos generados automáticamente por combustible</div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="label">Total (últimos 50 registros)</div>
          <div className="value">₲ {total.toLocaleString('es-PY')}</div>
        </div>
      </div>

      <div className="card">
        <h3>Registrar gasto</h3>
        <div className="sub">Gasto manual, no relacionado a combustible</div>
        <NuevoGastoForm />
      </div>

      <div className="card">
        <h3>Historial reciente</h3>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar gastos: {error.message}</p>}

        {gastos && gastos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => (
                <tr key={g.id}>
                  <td>{g.fecha}</td>
                  <td>{g.categoria}</td>
                  <td>{g.descripcion ?? '—'}</td>
                  <td className="mono-num">₲ {Number(g.monto).toLocaleString('es-PY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {gastos?.length === 0 && <p className="sub">Todavía no hay gastos registrados.</p>}
      </div>
    </div>
  )
}
