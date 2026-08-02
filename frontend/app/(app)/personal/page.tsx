import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import NuevoEmpleadoForm from './nuevo-empleado-form'
import FilaEmpleado from './fila-empleado'

export default async function PersonalPage() {
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: empleados, error } = await supabase
    .from('empleados')
    .select('*')
    .order('nombre')

  const anioActual = new Date().getFullYear()
  const { data: aguinaldos, error: errorAguinaldos } = await supabase
    .from('aguinaldo_estimado')
    .select('*')
    .eq('anio', anioActual)
    .order('nombre')

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Personal</h2>
          <div className="date">Fichas y documentos imprimibles</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/personal/notas" className="btn btn-ghost">
            📝 Notas
          </Link>
          <Link href="/personal/generar-documento" className="btn btn-primary">
            🖨️ Generar documento
          </Link>
        </div>
      </div>

      <div className="card">
        <h3>Nuevo empleado</h3>
        <NuevoEmpleadoForm />
      </div>

      <div className="card">
        <h3>Empleados</h3>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar empleados: {error.message}</p>}

        {empleados && empleados.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Salario</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((e) => (
                <FilaEmpleado key={e.id} empleado={e} />
              ))}
            </tbody>
          </table>
        )}

        {empleados?.length === 0 && <p className="sub">Todavía no hay empleados cargados.</p>}
      </div>

      <div className="card">
        <h3>Aguinaldo estimado ({anioActual})</h3>
        <p style={{ color: 'var(--brick)', fontWeight: 700, fontSize: 13 }}>
          Estimado — a confirmar con un contador antes de pagar.
        </p>

        {errorAguinaldos && (
          <p style={{ color: 'var(--brick)' }}>Error al cargar aguinaldos: {errorAguinaldos.message}</p>
        )}

        {aguinaldos && aguinaldos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Total pagado ({anioActual})</th>
                <th>Aguinaldo estimado</th>
              </tr>
            </thead>
            <tbody>
              {aguinaldos.map((a) => (
                <tr key={a.empleado_id}>
                  <td>
                    <Link href={`/personal/${a.empleado_id}`}>{a.nombre}</Link>
                  </td>
                  <td className="mono-num">₲ {Number(a.total_pagado_anio).toLocaleString('es-PY')}</td>
                  <td className="mono-num">₲ {Number(a.aguinaldo_estimado).toLocaleString('es-PY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {aguinaldos?.length === 0 && (
          <p className="sub">Ningún empleado con pagos registrados este año todavía.</p>
        )}
      </div>
    </div>
  )
}
