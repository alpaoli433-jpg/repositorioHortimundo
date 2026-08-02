import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import ImprimirButton from '@/components/imprimir-button'
import {
  calcularResumenPorPeriodos,
  calcularTendenciaSemanal,
  formatMonto,
  formatVariacion,
  type SemanaTendencia,
} from '@/lib/resumen-negocio'

function calcularEscalaBarras(semanas: SemanaTendencia[]) {
  const valores = semanas.flatMap((s) => [s.facturado, s.gastos, s.ganancia])
  const maxPositivo = Math.max(0, ...valores)
  const maxNegativo = Math.max(0, ...valores.map((v) => -v))
  const total = maxPositivo + maxNegativo || 1
  const lineaBase = (maxNegativo / total) * 100

  function altura(valor: number) {
    return (Math.abs(valor) / total) * 100
  }

  function posicion(valor: number) {
    return valor >= 0 ? lineaBase : lineaBase - altura(valor)
  }

  return { lineaBase, altura, posicion }
}

export default async function ReporteResumenPage() {
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()
  const hoy = new Date()

  const [datosPorPeriodo, tendenciaSemanal] = await Promise.all([
    calcularResumenPorPeriodos(supabase, hoy),
    calcularTendenciaSemanal(supabase, hoy),
  ])

  const escala = calcularEscalaBarras(tendenciaSemanal)

  return (
    <div>
      <div className="topbar no-print">
        <div>
          <h2>Resumen del negocio</h2>
          <div className="date">Reporte completo — las 5 franjas y la tendencia semanal</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/" className="btn btn-ghost">
            Volver
          </Link>
          <ImprimirButton label="Imprimir" />
        </div>
      </div>

      <div className="card">
        <h3>Detalle por período</h3>
        <div className="sub">Cada franja comparada contra el mismo tramo del período anterior</div>
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Facturado</th>
              <th>Gastos</th>
              <th>Ganancia neta</th>
              <th>Combustible</th>
            </tr>
          </thead>
          <tbody>
            {datosPorPeriodo.map((d) => (
              <tr key={d.id}>
                <td>
                  <b>{d.label}</b>
                </td>
                <td className="mono-num">
                  {formatMonto(d.facturado.valor)}
                  <br />
                  <span className="sub" style={{ marginBottom: 0 }}>
                    {formatVariacion(d.facturado.variacion).texto}
                  </span>
                </td>
                <td className="mono-num">
                  {formatMonto(d.gastos.valor)}
                  <br />
                  <span className="sub" style={{ marginBottom: 0 }}>
                    {formatVariacion(d.gastos.variacion).texto}
                  </span>
                </td>
                <td className="mono-num">
                  {formatMonto(d.ganancia.valor)}
                  <br />
                  <span className="sub" style={{ marginBottom: 0 }}>
                    {formatVariacion(d.ganancia.variacion).texto}
                  </span>
                </td>
                <td className="mono-num">
                  {formatMonto(d.combustible.valor)}
                  <br />
                  <span className="sub" style={{ marginBottom: 0 }}>
                    {formatVariacion(d.combustible.variacion).texto}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Tendencia semanal</h3>
        <div className="sub">Últimas 5 semanas consecutivas e independientes (no acumuladas)</div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <span className="sub" style={{ marginBottom: 0 }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                background: 'var(--harvest)',
                borderRadius: 2,
                marginRight: 6,
              }}
            />
            Facturado
          </span>
          <span className="sub" style={{ marginBottom: 0 }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                background: 'var(--brick)',
                borderRadius: 2,
                marginRight: 6,
              }}
            />
            Gastos
          </span>
          <span className="sub" style={{ marginBottom: 0 }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                background: 'var(--leaf)',
                borderRadius: 2,
                marginRight: 6,
              }}
            />
            Ganancia neta
          </span>
        </div>

        <div className="tendencia-chart">
          {tendenciaSemanal.map((s) => (
            <div className="tendencia-semana" key={s.label}>
              <div className="tendencia-barras">
                <div className="tendencia-baseline" style={{ bottom: `${escala.lineaBase}%` }} />
                <div className="tendencia-grupo">
                  <div className="tendencia-barra-wrap">
                    <div
                      className="tendencia-barra facturado"
                      style={{ bottom: `${escala.posicion(s.facturado)}%`, height: `${escala.altura(s.facturado)}%` }}
                    />
                  </div>
                  <div className="tendencia-barra-wrap">
                    <div
                      className="tendencia-barra gastos"
                      style={{ bottom: `${escala.posicion(s.gastos)}%`, height: `${escala.altura(s.gastos)}%` }}
                    />
                  </div>
                  <div className="tendencia-barra-wrap">
                    <div
                      className="tendencia-barra ganancia"
                      style={{ bottom: `${escala.posicion(s.ganancia)}%`, height: `${escala.altura(s.ganancia)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="tendencia-label">{s.label}</div>
            </div>
          ))}
        </div>

        <table style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Semana</th>
              <th>Facturado</th>
              <th>Gastos</th>
              <th>Ganancia neta</th>
            </tr>
          </thead>
          <tbody>
            {tendenciaSemanal.map((s) => (
              <tr key={s.label}>
                <td>
                  {s.label}
                  <br />
                  <span className="sub" style={{ marginBottom: 0 }}>
                    {s.inicio} – {s.fin}
                  </span>
                </td>
                <td className="mono-num">{formatMonto(s.facturado)}</td>
                <td className="mono-num">{formatMonto(s.gastos)}</td>
                <td className="mono-num">{formatMonto(s.ganancia)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
