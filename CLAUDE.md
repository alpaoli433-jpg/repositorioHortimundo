# HortiMundo — Contexto del proyecto

## Qué es esto
Sistema de gestión para HortiMundo, empresa hortofrutícola de Hugo Sanabria
(Caacupé, Paraguay). Lo usan Hugo (propietario) y su ayudante Rocío, desde
computadora y celular. Reemplaza planillas Excel y cálculos manuales.

## Stack
- Frontend: Next.js (App Router) + TypeScript, en /frontend
- Base de datos: Supabase (Postgres), con RLS activo en TODAS las tablas
- Autenticación: Supabase Auth, con tabla `perfiles` que asigna rol
- Migraciones SQL versionadas en /supabase/migrations

## Regla de seguridad no negociable
El frontend SOLO usa la `anon key`. La `service_role key` nunca se usa desde
el frontend ni se expone en código de cliente. Cualquier lógica sensible
(cálculos financieros, facturación) va en Supabase Edge Functions, no en el
navegador.

## Roles
- `propietario` (Hugo): acceso total.
- `ayudante` (Rocío): solo carga mercadería, stock y combustible. No ve
  finanzas, RRHH ni facturación. Esto se aplica con políticas RLS reales en
  la base, no solo ocultando cosas en la interfaz.
- La función `fn_rol_actual()` es la que usan las políticas RLS para decidir
  qué puede hacer cada usuario.

## Ambientes
- `hortimundo-staging`: donde se prueba todo. Se puede experimentar acá.
- `hortimundo-produccion`: NUNCA se aplican cambios sin probar antes en
  staging. Este ambiente todavía no está en uso activo.

## Convenciones de código
- Server Components por defecto; `'use client'` solo cuando hace falta
  interactividad (formularios, botones).
- Cliente de Supabase: `lib/supabase/client.ts` (navegador) y
  `lib/supabase/server.ts` (servidor) — no crear otros.
- Componentes interactivos chicos (como botones con acción) van en su propio
  archivo, separados del Server Component que los usa.
- Toda pantalla restringida por rol debe usar `<AccesoRestringido />` desde
  `/components/acceso-restringido.tsx` antes de renderizar el contenido —
  no crear el chequeo de rol de forma manual en cada página nueva.

## Estado actual del proyecto
- [x] Entorno (Git, GitHub, Next.js, Supabase) configurado
- [x] Esquema completo de base de datos (ver /supabase/migrations)
- [x] Login, roles y protección de rutas (middleware.ts) funcionando
- [x] Módulo de Clientes (listado + alta) funcionando y probado con RLS
- [x] Catálogo de productos (listado + alta, con sidebar y tokens de diseño
      del mockup ya aplicados — Clientes todavía no migrado a ese estilo)
- [x] Mercadería (entrada/salida) + stock (usa la vista `stock` ya definida
      en la migración; sin cliente_id en el formulario todavía — pendiente
      definir ese flujo)
- [x] Merma (RLS de la tabla estaba incompleta en staging — faltaban las 4
      policies que ya existían en el archivo de migración; se aplicaron)
- [x] Combustible + gastos (Combustible visible para ambos roles, Gastos
      solo propietario — el trigger `fn_combustible_a_gastos` sigue
      generando el gasto automático; no hay sync de vuelta si se edita o
      borra una carga de combustible, es un gap preexistente del esquema)
- [x] RRHH completo (empleados, salarios, bonos, vales, préstamos +
      documentos imprimibles con window.print(), todo dentro de la ficha de
      cada empleado en /personal/[id]). Falta solo la vista de aguinaldo
      estimado (aguinaldo_estimado), no pedida todavía
- [ ] Ventas con múltiples productos
- [ ] Control de Lechugas (módulo aparte del inventario general)
- [ ] Facturación electrónica (pendiente confirmación de proveedor — NO
      empezar esta parte sin aviso explícito)
- [ ] Aplicar diseño visual definitivo (mockups ya aprobados por el cliente)

## Qué NO hacer sin preguntar primero
- No tocar el proyecto `hortimundo-produccion`.
- No implementar la integración de facturación electrónica todavía.
- No auto-aceptar cambios en archivos de RLS, triggers o funciones con
  `security definer` sin revisión explícita línea por línea.
  ## Diseño visual de referencia
Los mockups aprobados por el cliente están en /design (archivos HTML
estáticos, no funcionales). Definen: paleta de colores, tipografía, estilo
de tarjetas tipo "ticket", sidebar de navegación, y la estructura de cada
pantalla (Panel, Clientes, Facturación, Personal, Cargar venta, Control de
Lechugas). Al construir cualquier pantalla nueva, seguir ese mismo lenguaje
visual desde el principio — no construir "feo" para después rediseñar.