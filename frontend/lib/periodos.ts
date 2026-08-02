import {
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  format,
} from 'date-fns'

export type PeriodoId = 'hoy' | 'semana' | 'mes' | 'trimestre' | 'anio'

export const PERIODOS: { id: PeriodoId; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'trimestre', label: 'Trimestre' },
  { id: 'anio', label: 'Año' },
]

export type RangoFechas = {
  actualInicio: string
  actualFin: string
  anteriorInicio: string
  anteriorFin: string
}

function fmt(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

/**
 * "Mismos días transcurridos": el período actual va desde su inicio hasta
 * hoy (no hasta el final del período), y el anterior se compara con la
 * misma cantidad de días transcurridos, no con el período calendario
 * completo — comparar un mes parcial contra uno completo siempre haría
 * ver "peor" al actual solo por tener menos días acumulados.
 */
export function calcularRango(periodo: PeriodoId, hoy: Date): RangoFechas {
  switch (periodo) {
    case 'hoy': {
      const ayer = subDays(hoy, 1)
      return { actualInicio: fmt(hoy), actualFin: fmt(hoy), anteriorInicio: fmt(ayer), anteriorFin: fmt(ayer) }
    }
    case 'semana': {
      const inicioActual = startOfWeek(hoy, { weekStartsOn: 1 })
      return {
        actualInicio: fmt(inicioActual),
        actualFin: fmt(hoy),
        anteriorInicio: fmt(subWeeks(inicioActual, 1)),
        anteriorFin: fmt(subWeeks(hoy, 1)),
      }
    }
    case 'mes': {
      const inicioActual = startOfMonth(hoy)
      return {
        actualInicio: fmt(inicioActual),
        actualFin: fmt(hoy),
        anteriorInicio: fmt(startOfMonth(subMonths(hoy, 1))),
        anteriorFin: fmt(subMonths(hoy, 1)),
      }
    }
    case 'trimestre': {
      const inicioActual = startOfQuarter(hoy)
      return {
        actualInicio: fmt(inicioActual),
        actualFin: fmt(hoy),
        anteriorInicio: fmt(startOfQuarter(subQuarters(hoy, 1))),
        anteriorFin: fmt(subQuarters(hoy, 1)),
      }
    }
    case 'anio': {
      const inicioActual = startOfYear(hoy)
      return {
        actualInicio: fmt(inicioActual),
        actualFin: fmt(hoy),
        anteriorInicio: fmt(startOfYear(subYears(hoy, 1))),
        anteriorFin: fmt(subYears(hoy, 1)),
      }
    }
  }
}
