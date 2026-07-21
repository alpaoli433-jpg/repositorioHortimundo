import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import ImprimirButton from '@/components/imprimir-button'

export default async function PrestamoPage({
  params,
}: {
  params: Promise<{ id: string; prestamoId: string }>
}) {
  const { id, prestamoId } = await params
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

  const { data: prestamo } = await supabase
    .from('prestamos')
    .select('*')
    .eq('id', prestamoId)
    .single()

  if (!empleado || !prestamo) {
    notFound()
  }

  return (
    <div>
      <div className="topbar no-print">
        <div>
          <h2>Préstamo al personal</h2>
          <div className="date">Listo para imprimir y firmar</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href={`/personal/${empleado.id}`} className="btn btn-ghost">
            Volver
          </Link>
          <ImprimirButton />
        </div>
      </div>

      <div className="doc-preview">
        <h4>HortiMundo</h4>
        <div className="doc-sub">Préstamo al personal — {prestamo.fecha}</div>
        <div className="doc-row">
          <span>Empleado</span>
          <span>{empleado.nombre}</span>
        </div>
        <div className="doc-row">
          <span>Cargo</span>
          <span>{empleado.cargo ?? '—'}</span>
        </div>
        <div className="doc-row">
          <span>Fecha</span>
          <span>{prestamo.fecha}</span>
        </div>
        <div className="doc-row">
          <span>Condiciones</span>
          <span>{prestamo.condiciones ?? '—'}</span>
        </div>
        <div className="doc-total">
          <span>Monto</span>
          <span>₲ {Number(prestamo.monto).toLocaleString('es-PY')}</span>
        </div>
        <div className="sign-row">
          <div className="sign-box">Firma del empleado</div>
          <div className="sign-box">Firma del empleador</div>
        </div>
      </div>
    </div>
  )
}
