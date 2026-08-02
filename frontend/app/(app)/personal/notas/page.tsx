import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import NuevaNotaForm from './nueva-nota-form'
import FilaNota from './fila-nota'

export default async function NotasPage() {
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: empleados } = await supabase
    .from('empleados')
    .select('id, nombre')
    .order('nombre')

  const { data: notas, error } = await supabase
    .from('notas')
    .select('*, empleados(nombre)')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Notas</h2>
          <div className="date">Notas internas, generales o por empleado</div>
        </div>
        <Link href="/personal" className="btn btn-ghost">
          Volver a Personal
        </Link>
      </div>

      <div className="card">
        <h3>Nueva nota</h3>
        <NuevaNotaForm empleados={empleados ?? []} />
      </div>

      <div className="card">
        <h3>Notas guardadas</h3>

        {error && <p style={{ color: 'var(--brick)' }}>Error al cargar notas: {error.message}</p>}

        {notas && notas.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Fecha</th>
                <th>Empleado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notas.map((n) => (
                <FilaNota key={n.id} nota={n} empleados={empleados ?? []} />
              ))}
            </tbody>
          </table>
        )}

        {notas?.length === 0 && <p className="sub">Todavía no hay notas guardadas.</p>}
      </div>
    </div>
  )
}
