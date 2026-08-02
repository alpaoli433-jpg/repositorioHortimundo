import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import NuevoPagoForm from './nuevo-pago-form'
import NuevoBonoForm from './nuevo-bono-form'
import NuevoValeForm from './nuevo-vale-form'
import NuevoPrestamoForm from './nuevo-prestamo-form'
import FilaBono from './fila-bono'
import FilaVale from './fila-vale'
import FilaPrestamo from './fila-prestamo'

export default async function EmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: empleado } = await supabase
    .from('empleados')
    .select('*')
    .eq('id', id)
    .single()

  if (!empleado) {
    notFound()
  }

  const { data: pagos, error } = await supabase
    .from('salarios_pagados')
    .select('*')
    .eq('empleado_id', id)
    .order('mes', { ascending: false })

  const { data: bonos, error: errorBonos } = await supabase
    .from('bonos')
    .select('*')
    .eq('empleado_id', id)
    .order('fecha', { ascending: false })

  const { data: vales, error: errorVales } = await supabase
    .from('vales_adelanto')
    .select('*')
    .eq('empleado_id', id)
    .order('fecha', { ascending: false })

  const { data: prestamos, error: errorPrestamos } = await supabase
    .from('prestamos')
    .select('*')
    .eq('empleado_id', id)
    .order('fecha', { ascending: false })

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>{empleado.nombre}</h2>
          <div className="date">
            {empleado.cargo ?? 'Sin cargo'} · Ingreso {empleado.fecha_ingreso ?? '—'} ·{' '}
            <span className={`badge ${empleado.estado === 'activo' ? 'activo' : 'inactivo'}`}>{empleado.estado}</span>
          </div>
        </div>
        <Link href="/personal" className="btn btn-ghost">
          Volver
        </Link>
      </div>

      <div className="card">
        <h3>Registrar pago de salario</h3>
        <div className="sub">Genera un registro con recibo imprimible</div>
        <NuevoPagoForm empleadoId={empleado.id} salarioSugerido={empleado.salario} />
      </div>

      <div className="card">
        <h3>Historial de pagos</h3>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar pagos: {error.message}</p>}

        {pagos && pagos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.mes}</td>
                  <td className="mono-num">₲ {Number(p.monto).toLocaleString('es-PY')}</td>
                  <td>
                    <Link href={`/personal/${empleado.id}/recibo/${p.id}`} className="btn btn-ghost btn-sm">
                      Ver recibo
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagos?.length === 0 && <p className="sub">Todavía no hay pagos registrados.</p>}
      </div>

      <div className="card">
        <h3>Bonos</h3>
        <div className="sub">Genera un documento imprimible</div>
        <NuevoBonoForm empleadoId={empleado.id} />

        {errorBonos && <p style={{ color: 'var(--brick)' }}>Error al cargar bonos: {errorBonos.message}</p>}

        {bonos && bonos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Motivo</th>
                <th>Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bonos.map((b) => (
                <FilaBono key={b.id} bono={b} empleadoId={empleado.id} />
              ))}
            </tbody>
          </table>
        )}

        {bonos?.length === 0 && <p className="sub">Todavía no hay bonos registrados.</p>}
      </div>

      <div className="card">
        <h3>Vales de adelanto</h3>
        <div className="sub">Genera un documento imprimible</div>
        <NuevoValeForm empleadoId={empleado.id} />

        {errorVales && <p style={{ color: 'var(--brick)' }}>Error al cargar vales: {errorVales.message}</p>}

        {vales && vales.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Observaciones</th>
                <th>Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vales.map((v) => (
                <FilaVale key={v.id} vale={v} empleadoId={empleado.id} />
              ))}
            </tbody>
          </table>
        )}

        {vales?.length === 0 && <p className="sub">Todavía no hay vales registrados.</p>}
      </div>

      <div className="card">
        <h3>Préstamos</h3>
        <div className="sub">Genera un documento imprimible con condiciones</div>
        <NuevoPrestamoForm empleadoId={empleado.id} />

        {errorPrestamos && (
          <p style={{ color: 'var(--brick)' }}>Error al cargar préstamos: {errorPrestamos.message}</p>
        )}

        {prestamos && prestamos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Condiciones</th>
                <th>Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prestamos.map((p) => (
                <FilaPrestamo key={p.id} prestamo={p} empleadoId={empleado.id} />
              ))}
            </tbody>
          </table>
        )}

        {prestamos?.length === 0 && <p className="sub">Todavía no hay préstamos registrados.</p>}
      </div>
    </div>
  )
}
