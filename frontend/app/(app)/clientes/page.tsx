import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import NuevoClienteForm from './nuevo-cliente-form'
export default async function ClientesPage() {
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre')

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Clientes</h2>
          <div className="date">Listado de clientes</div>
        </div>
      </div>

      <div className="card">
        <h3>Nuevo cliente</h3>
        <NuevoClienteForm />
      </div>

      <div className="card">
        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar clientes: {error.message}</p>}

        {clientes && clientes.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>RUC</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <b>{cliente.nombre}</b>
                  </td>
                  <td>{cliente.ruc ?? '—'}</td>
                  <td>
                    <span className={`badge ${cliente.estado === 'activo' ? 'activo' : 'inactivo'}`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td>
                    <Link href={`/clientes/${cliente.id}`} className="btn btn-ghost btn-sm">
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {clientes?.length === 0 && <p className="sub">Todavía no hay clientes cargados.</p>}
      </div>
    </div>
  )
}