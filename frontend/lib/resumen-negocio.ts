import type { SupabaseClient } from '@supabase/supabase-js'
import { startOfWeek, subWeeks, addDays, format } from 'date-fns'
import { PERIODOS, calcularRango, type PeriodoId } from './periodos'

type Fila = { fecha: string; valor: number }

function sumarEnRango(filas: Fila[], inicio: string, fin: string) {
  return filas.filter((f) => f.fecha >= inicio && f.fecha <= fin).reduce((acc, f) => acc + f.valor, 0)
}

function variacion(actual: number, anterior: number): number | null {
  if (anterior === 0) {
    return actual === 0 ? null : Infinity
  }
  return ((actual - anterior) / anterior) * 100
}

export function formatMonto(valor: number) {
  const signo = valor < 0 ? '-' : ''
  return `${signo}₲ ${Math.abs(Math.round(valor)).toLocaleString('es-PY')}`
}

export type VariacionClase = 'positiva' | 'negativa' | 'neutra'

export function formatVariacion(v: number | null): { texto: string; clase: VariacionClase } {
  if (v === null) {
    return { texto: '—', clase: 'neutra' }
  }
  if (v === Infinity) {
    return { texto: 'Nuevo', clase: 'positiva' }
  }
  const signo = v >= 0 ? '+' : ''
  const clase: VariacionClase = v >= 0 ? 'positiva' : 'negativa'
  return { texto: `${signo}${v.toFixed(1)}%`, clase }
}

export type StatItem = { valor: number; variacion: number | null }

export type DatosPeriodo = {
  id: PeriodoId
  label: string
  facturado: StatItem
  gastos: StatItem
  ganancia: StatItem
  combustible: StatItem
}

export async function calcularResumenPorPeriodos(
  supabase: SupabaseClient,
  hoy: Date
): Promise<DatosPeriodo[]> {
  const rangoAnio = calcularRango('anio', hoy)
  const desde = rangoAnio.anteriorInicio

  const [{ data: ventas }, { data: gastos }, { data: combustible }] = await Promise.all([
    supabase.from('ventas_resumen').select('fecha, total').gte('fecha', desde),
    supabase.from('gastos').select('fecha, monto').gte('fecha', desde),
    supabase.from('combustible').select('fecha, monto').gte('fecha', desde),
  ])

  const filasVentas: Fila[] = (ventas ?? []).map((v) => ({ fecha: v.fecha as string, valor: Number(v.total) }))
  const filasGastos: Fila[] = (gastos ?? []).map((g) => ({ fecha: g.fecha as string, valor: Number(g.monto) }))
  const filasCombustible: Fila[] = (combustible ?? []).map((c) => ({
    fecha: c.fecha as string,
    valor: Number(c.monto),
  }))

  return PERIODOS.map((periodo) => {
    const rango = calcularRango(periodo.id, hoy)

    const facturadoActual = sumarEnRango(filasVentas, rango.actualInicio, rango.actualFin)
    const facturadoAnterior = sumarEnRango(filasVentas, rango.anteriorInicio, rango.anteriorFin)
    const gastosActual = sumarEnRango(filasGastos, rango.actualInicio, rango.actualFin)
    const gastosAnterior = sumarEnRango(filasGastos, rango.anteriorInicio, rango.anteriorFin)
    const combustibleActual = sumarEnRango(filasCombustible, rango.actualInicio, rango.actualFin)
    const combustibleAnterior = sumarEnRango(filasCombustible, rango.anteriorInicio, rango.anteriorFin)
    const gananciaActual = facturadoActual - gastosActual
    const gananciaAnterior = facturadoAnterior - gastosAnterior

    return {
      id: periodo.id,
      label: periodo.label,
      facturado: { valor: facturadoActual, variacion: variacion(facturadoActual, facturadoAnterior) },
      gastos: { valor: gastosActual, variacion: variacion(gastosActual, gastosAnterior) },
      ganancia: { valor: gananciaActual, variacion: variacion(gananciaActual, gananciaAnterior) },
      combustible: { valor: combustibleActual, variacion: variacion(combustibleActual, combustibleAnterior) },
    }
  })
}

export type SemanaTendencia = {
  label: string
  inicio: string
  fin: string
  facturado: number
  gastos: number
  ganancia: number
}

/**
 * 5 semanas consecutivas e independientes (no anidadas, a diferencia de
 * calcularResumenPorPeriodos): semana -4 a -1 son lunes a domingo
 * completos, la actual es lunes a hoy (parcial, es la más reciente).
 * Sirve para ver una tendencia real semana a semana, no un acumulado.
 */
export async function calcularTendenciaSemanal(
  supabase: SupabaseClient,
  hoy: Date
): Promise<SemanaTendencia[]> {
  const inicioSemanaActual = startOfWeek(hoy, { weekStartsOn: 1 })
  const desde = format(subWeeks(inicioSemanaActual, 4), 'yyyy-MM-dd')

  const [{ data: ventas }, { data: gastos }] = await Promise.all([
    supabase.from('ventas_resumen').select('fecha, total').gte('fecha', desde),
    supabase.from('gastos').select('fecha, monto').gte('fecha', desde),
  ])

  const filasVentas: Fila[] = (ventas ?? []).map((v) => ({ fecha: v.fecha as string, valor: Number(v.total) }))
  const filasGastos: Fila[] = (gastos ?? []).map((g) => ({ fecha: g.fecha as string, valor: Number(g.monto) }))

  const semanas: SemanaTendencia[] = []

  for (let i = 4; i >= 0; i--) {
    const inicio = subWeeks(inicioSemanaActual, i)
    const fin = i === 0 ? hoy : addDays(inicio, 6)
    const inicioStr = format(inicio, 'yyyy-MM-dd')
    const finStr = format(fin, 'yyyy-MM-dd')

    const facturado = sumarEnRango(filasVentas, inicioStr, finStr)
    const gastosSemana = sumarEnRango(filasGastos, inicioStr, finStr)

    semanas.push({
      label: i === 0 ? 'Esta semana' : `Semana -${i}`,
      inicio: inicioStr,
      fin: finStr,
      facturado,
      gastos: gastosSemana,
      ganancia: facturado - gastosSemana,
    })
  }

  return semanas
}
