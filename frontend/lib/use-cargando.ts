'use client'

import { useState } from 'react'

export function useCargando() {
  const [cargando, setCargando] = useState(false)

  async function conCargando<T>(fn: () => PromiseLike<T>): Promise<T> {
    setCargando(true)
    try {
      return await fn()
    } finally {
      setCargando(false)
    }
  }

  return { cargando, conCargando }
}
