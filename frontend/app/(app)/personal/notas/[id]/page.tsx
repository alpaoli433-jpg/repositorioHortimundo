import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import AccesoRestringido from '@/components/acceso-restringido'
import ImprimirButton from '@/components/imprimir-button'

export default async function NotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return <AccesoRestringido />
  }

  const supabase = await createClient()

  const { data: nota } = await supabase
    .from('notas')
    .select('*, empleados(nombre)')
    .eq('id', id)
    .single()

  if (!nota) {
    notFound()
  }

  return (
    <div>
      <div className="topbar no-print">
        <div>
          <h2>Nota</h2>
          <div className="date">Lista para imprimir</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/personal/notas" className="btn btn-ghost">
            Volver
          </Link>
          <ImprimirButton />
        </div>
      </div>

      <div className="doc-preview">
        <h4>HortiMundo</h4>
        <div className="doc-sub">
          {nota.titulo} — {nota.fecha}
          {nota.empleados?.nombre && <> · {nota.empleados.nombre}</>}
        </div>
        <div className="doc-markdown">
          <ReactMarkdown>{nota.contenido}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
