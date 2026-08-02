'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PeriodoId } from '@/lib/periodos'
import { PERIODOS } from '@/lib/periodos'
import { formatMonto, formatVariacion, type DatosPeriodo, type StatItem } from '@/lib/resumen-negocio'

function Ticket({ label, item }: { label: string; item: StatItem }) {
  const variacion = formatVariacion(item.variacion)
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{formatMonto(item.valor)}</div>
      <div className={`variacion ${variacion.clase}`}>{variacion.texto} vs. período anterior</div>
    </div>
  )
}

export default function PanelStats({ datos }: { datos: DatosPeriodo[] }) {
  const [activoId, setActivoId] = useState<PeriodoId>('hoy')
  const activo = datos.find((d) => d.id === activoId) ?? datos[0]

  return (
    <div className="card">
      <div className="topbar no-print" style={{ marginBottom: 10 }}>
        <div>
          <h3 style={{ margin: 0 }}>Resumen del negocio</h3>
          <div className="sub" style={{ marginBottom: 0 }}>
            Comparado contra el mismo tramo del período anterior
          </div>
        </div>
        <Link href="/reportes/resumen" className="btn btn-primary">
          Descargar resumen PDF
        </Link>
      </div>

      <div className="periodo-tabs no-print">
        {PERIODOS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`periodo-tab${p.id === activoId ? ' active' : ''}`}
            onClick={() => setActivoId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="kpi-row no-print">
        <Ticket label="Facturado" item={activo.facturado} />
        <Ticket label="Gastos" item={activo.gastos} />
        <Ticket label="Ganancia neta" item={activo.ganancia} />
        <Ticket label="Combustible" item={activo.combustible} />
      </div>
    </div>
  )
}
