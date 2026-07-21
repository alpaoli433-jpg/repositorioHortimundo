import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import ImprimirButton from '@/components/imprimir-button'

export default async function BonoPage({
  params,
}: {
  params: Promise<{ id: string; bonoId: string }>
}) {
  const { id, bonoId } = await params
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

  const { data: bono } = await supabase
    .from('bonos')
    .select('*')
    .eq('id', bonoId)
    .single()

  if (!empleado || !bono) {
    notFound()
  }

  return (
    <div>
      <div className="topbar no-print">
        <div>
          <h2>Bono</h2>
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
        <div className="doc-sub">Bono — {bono.fecha}</div>
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
          <span>{bono.fecha}</span>
        </div>
        <div className="doc-row">
          <span>Motivo</span>
          <span>{bono.motivo ?? '—'}</span>
        </div>
        <div className="doc-total">
          <span>Monto</span>
          <span>₲ {Number(bono.monto).toLocaleString('es-PY')}</span>
        </div>
        <div className="sign-row">
          <div className="sign-box">Firma del empleado</div>
          <div className="sign-box">Firma del empleador</div>
        </div>
      </div>
    </div>
  )
}
