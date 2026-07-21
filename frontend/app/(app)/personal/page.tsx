import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import NuevoEmpleadoForm from './nuevo-empleado-form'

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

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Personal</h2>
          <div className="date">Fichas y documentos imprimibles</div>
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
              </tr>
            </thead>
            <tbody>
              {empleados.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link href={`/personal/${e.id}`}>
                      <b>{e.nombre}</b>
                    </Link>
                  </td>
                  <td>{e.cargo ?? '—'}</td>
                  <td className="mono-num">₲ {Number(e.salario).toLocaleString('es-PY')}</td>
                  <td>
                    <span className={`badge ${e.estado === 'activo' ? 'activo' : 'inactivo'}`}>{e.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {empleados?.length === 0 && <p className="sub">Todavía no hay empleados cargados.</p>}
      </div>
    </div>
  )
}
