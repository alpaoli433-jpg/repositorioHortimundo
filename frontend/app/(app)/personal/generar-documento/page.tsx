import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import GenerarDocumentoWizard from './generar-documento-wizard'

export default async function GenerarDocumentoPage() {
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: empleados } = await supabase
    .from('empleados')
    .select('id, nombre, salario')
    .order('nombre')

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Generar documento</h2>
          <div className="date">Elegí empleado, tipo de documento, y completá los datos</div>
        </div>
      </div>

      <div className="card">
        <GenerarDocumentoWizard empleados={empleados ?? []} />
      </div>
    </div>
  )
}
