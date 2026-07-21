import { createClient } from './server'

export type Rol = 'propietario' | 'ayudante'

export async function getPerfilActual() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, nombre: null, rol: null as Rol | null }
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', user.id)
    .single()

  return {
    user,
    nombre: perfil?.nombre ?? null,
    rol: (perfil?.rol as Rol | undefined) ?? null,
  }
}
