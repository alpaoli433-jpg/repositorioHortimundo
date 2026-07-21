import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import ImprimirButton from '@/components/imprimir-button'

export default async function ValePage({
  params,
}: {
  params: Promise<{ id: string; valeId: string }>
}) {
  const { id, valeId } = await params
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

  const { data: vale } = await supabase
    .from('vales_adelanto')
    .select('*')
    .eq('id', valeId)
    .single()

  if (!empleado || !vale) {
    notFound()
  }

  return (
    <div>
      <div className="topbar no-print">
        <div>
          <h2>Vale de adelanto</h2>
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
        <div className="doc-sub">Vale de adelanto — {vale.fecha}</div>
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
          <span>{vale.fecha}</span>
        </div>
        <div className="doc-row">
          <span>Observaciones</span>
          <span>{vale.observaciones ?? '—'}</span>
        </div>
        <div className="doc-total">
          <span>Monto solicitado</span>
          <span>₲ {Number(vale.monto).toLocaleString('es-PY')}</span>
        </div>
        <div className="sign-row">
          <div className="sign-box">Firma del empleado</div>
          <div className="sign-box">Firma del empleador</div>
        </div>
      </div>
    </div>
  )
}
