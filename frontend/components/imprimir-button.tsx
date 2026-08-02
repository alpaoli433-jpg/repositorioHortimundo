'use client'

export default function ImprimirButton({ label = 'Imprimir' }: { label?: string }) {
  return (
    <button className="btn btn-primary no-print" onClick={() => window.print()}>
      {label}
    </button>
  )
}
