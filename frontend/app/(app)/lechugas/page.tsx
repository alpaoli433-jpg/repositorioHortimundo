import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import NuevaVariedadForm from './nueva-variedad-form'
import NuevoMovimientoLechugaForm from './nuevo-movimiento-form'

function diasDesdeHoy(fecha: string) {
  const hoy = new Date(new Date().toISOString().slice(0, 10))
  const objetivo = new Date(fecha)
  return Math.round((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function LechugasPage() {
  const { rol } = await getPerfilActual()
  const supabase = await createClient()

  const { data: variedades } = await supabase
    .from('lechuga_variedades')
    .select('id, nombre, unidad')
    .eq('activa', true)
    .order('nombre')

  const { data: resumen, error } = await supabase
    .from('lechuga_resumen')
    .select('*')
    .order('nombre')

  const { data: movimientos, error: errorMovimientos } = await supabase
    .from('lechuga_movimientos')
    .select('*, lechuga_variedades(nombre, unidad)')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(50)

  const { data: entradas } = await supabase
    .from('lechuga_movimientos')
    .select('proveedor')
    .eq('tipo', 'entrada')
    .not('proveedor', 'is', null)

  const variedadesActivas = resumen?.filter((v) => v.activa).length ?? 0
  const totalDisponible = resumen?.reduce((acc, v) => acc + Number(v.cantidad_disponible), 0) ?? 0
  const porVencer =
    resumen?.filter((v) => v.ultima_entrada_vencimiento && diasDesdeHoy(v.ultima_entrada_vencimiento) <= 1) ?? []
  const totalPorVencer = porVencer.reduce((acc, v) => acc + Number(v.cantidad_disponible), 0)
  const proveedoresUnicos = new Set((entradas ?? []).map((e) => e.proveedor)).size

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Control de Lechugas</h2>
          <div className="date">Seguimiento independiente del inventario general</div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="label">Variedades activas</div>
          <div className="value">{variedadesActivas}</div>
        </div>
        <div className="kpi">
          <div className="label">Total disponible</div>
          <div className="value">{totalDisponible} un.</div>
        </div>
        <div className="kpi">
          <div className="label">Por vencer</div>
          <div className="value">{totalPorVencer} un.</div>
        </div>
        <div className="kpi">
          <div className="label">Proveedores</div>
          <div className="value">{proveedoresUnicos}</div>
        </div>
      </div>

      {rol === 'propietario' && (
        <div className="card">
          <h3>Nueva variedad</h3>
          <NuevaVariedadForm />
        </div>
      )}

      <div className="card">
        <h3>Registrar movimiento</h3>
        <div className="sub">Entrada o salida de una variedad de lechuga</div>

        {variedades && variedades.length > 0 ? (
          <NuevoMovimientoLechugaForm variedades={variedades} />
        ) : (
          <p className="sub">Todavía no hay variedades activas cargadas.</p>
        )}
      </div>

      <div className="card">
        <h3>Variedades</h3>
        <div className="sub">Detalle exclusivo de lechugas, separado del stock general</div>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar variedades: {error.message}</p>}

        {resumen && resumen.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Variedad</th>
                <th>Disponible</th>
                <th>Última entrada</th>
                <th>Proveedor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {resumen.map((v) => {
                const vencida =
                  v.ultima_entrada_vencimiento && diasDesdeHoy(v.ultima_entrada_vencimiento) <= 1
                return (
                  <tr key={v.variedad_id}>
                    <td className="var-pill">{v.nombre}</td>
                    <td className="mono-num">
                      {v.cantidad_disponible} {v.unidad}
                    </td>
                    <td>{v.ultima_entrada_fecha ?? '—'}</td>
                    <td>{v.ultima_entrada_proveedor ?? '—'}</td>
                    <td>
                      {v.ultima_entrada_vencimiento ? (
                        <>
                          <span className={`fresh-dot ${vencida ? 'warn' : 'ok'}`}></span>
                          {vencida ? 'Por vencer' : 'Fresca'}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {resumen?.length === 0 && <p className="sub">Todavía no hay variedades cargadas.</p>}
      </div>

      <div className="card">
        <h3>Historial reciente</h3>

        {errorMovimientos && (
          <p style={{ color: 'var(--brick)' }}>Error al cargar movimientos: {errorMovimientos.message}</p>
        )}

        {movimientos && movimientos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Variedad</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Proveedor</th>
                <th>Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td>{m.fecha}</td>
                  <td>{m.lechuga_variedades?.nombre}</td>
                  <td>
                    <span className={`badge ${m.tipo === 'entrada' ? 'activo' : 'saldo'}`}>{m.tipo}</span>
                  </td>
                  <td className="mono-num">
                    {m.cantidad} {m.lechuga_variedades?.unidad}
                  </td>
                  <td>{m.proveedor ?? '—'}</td>
                  <td>{m.fecha_vencimiento ?? '—'}</td>
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
