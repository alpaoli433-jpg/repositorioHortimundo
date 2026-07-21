import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import ImprimirButton from '@/components/imprimir-button'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function formatearPeriodo(mes: string) {
  const [anio, mesNum] = mes.split('-').map(Number)
  const nombreMes = MESES[mesNum - 1]
  return `${nombreMes} de ${anio}`
}

export default async function ReciboPage({
  params,
}: {
  params: Promise<{ id: string; pagoId: string }>
}) {
  const { id, pagoId } = await params
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

  const { data: pago } = await supabase
    .from('salarios_pagados')
    .select('*')
    .eq('id', pagoId)
    .single()

  if (!empleado || !pago) {
    notFound()
  }

  return (
    <div>
      <div className="topbar no-print">
        <div>
          <h2>Recibo de sueldo</h2>
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
        <div className="doc-sub">Recibo de sueldo — {formatearPeriodo(pago.mes)}</div>
        <div className="doc-row">
          <span>Empleado</span>
          <span>{empleado.nombre}</span>
        </div>
        <div className="doc-row">
          <span>Cargo</span>
          <span>{empleado.cargo ?? '—'}</span>
        </div>
        <div className="doc-row">
          <span>Período</span>
          <span>{formatearPeriodo(pago.mes)}</span>
        </div>
        <div className="doc-row">
          <span>Salario base</span>
          <span className="mono-num">₲ {Number(pago.monto).toLocaleString('es-PY')}</span>
        </div>
        <div className="doc-row">
          <span>Descuentos</span>
          <span className="mono-num">₲ 0</span>
        </div>
        <div className="doc-total">
          <span>Total a pagar</span>
          <span>₲ {Number(pago.monto).toLocaleString('es-PY')}</span>
        </div>
        <div className="sign-row">
          <div className="sign-box">Firma del empleado</div>
          <div className="sign-box">Firma del empleador</div>
        </div>
      </div>
    </div>
  )
}
