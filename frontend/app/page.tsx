import { createClient } from '@/lib/supabase/server'
import LogoutButton from './logout-button'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: perfil, error: errorPerfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', user?.id)
    .single()

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: 24 }}>
      <h1>HortiMundo</h1>
      {errorPerfil && <p style={{ color: 'red' }}>Error de perfil: {errorPerfil.message}</p>}
      <p style={{ fontSize: 12, color: '#888' }}>user.id: {user?.id} — email: {user?.email}</p>
      <p>
        Hola, <strong>{perfil?.nombre ?? 'Usuario'}</strong>
      </p>
      <p>Tu rol: {perfil?.rol}</p>

      <LogoutButton />
    </div>
  )
}