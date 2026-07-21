import { createClient } from '@/lib/supabase/server'
import NuevoCombustibleForm from './nuevo-combustible-form'

export default async function CombustiblePage() {
  const supabase = await createClient()

  const { data: cargas, error } = await supabase
    .from('combustible')
    .select('*')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Combustible</h2>
          <div className="date">Cargas de combustible de los vehículos</div>
        </div>
      </div>

      <div className="card">
        <h3>Registrar carga</h3>
        <div className="sub">Se refleja automáticamente como gasto</div>
        <NuevoCombustibleForm />
      </div>

      <div className="card">
        <h3>Historial reciente</h3>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar combustible: {error.message}</p>}

        {cargas && cargas.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>Litros</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {cargas.map((c) => (
                <tr key={c.id}>
                  <td>{c.fecha}</td>
                  <td>{c.vehiculo ?? '—'}</td>
                  <td className="mono-num">{c.litros ?? '—'}</td>
                  <td className="mono-num">₲ {Number(c.monto).toLocaleString('es-PY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {cargas?.length === 0 && <p className="sub">Todavía no hay cargas registradas.</p>}
      </div>
    </div>
  )
}
