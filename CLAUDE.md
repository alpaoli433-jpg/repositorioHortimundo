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
      del mockup ya aplicados)
- [x] Mercadería (entrada/salida) + stock (usa la vista `stock` ya definida
      en la migración; el formulario manual no expone `cliente_id` — ese
      campo quedó resuelto al construir Ventas, ver más abajo). Columnas
      `hora` (`time`, opcional) y `observaciones` (`text`, opcional)
      agregadas después (propuesta del cliente, punto 1) — aditivas, no
      tocan `fecha` ni la vista `stock` (que nunca agrupó por fecha)
- [x] Merma (RLS de la tabla estaba incompleta en staging — faltaban las 4
      policies que ya existían en el archivo de migración; se aplicaron)
- [x] Combustible + gastos (Combustible visible para ambos roles, Gastos
      solo propietario — el trigger `fn_combustible_a_gastos` sigue
      generando el gasto automático; no hay sync de vuelta si se edita o
      borra una carga de combustible, es un gap preexistente del esquema)
- [x] RRHH completo (empleados, salarios, bonos, vales, préstamos +
      documentos imprimibles con window.print(), todo dentro de la ficha de
      cada empleado en /personal/[id]). Incluye tarjeta de "Aguinaldo
      estimado" en /personal (vista `aguinaldo_estimado`, agrupada por año
      — solo empleados con pagos registrados en el año actual, con
      aclaración visible de que es estimado y debe confirmarse con un
      contador antes de pagar)
- [x] Notas (sub-módulo de Personal, /personal/notas): reemplaza las notas
      sueltas en Word — título, contenido libre, fecha, y asociación
      opcional a un empleado (`empleado_id` nullable, queda "General" si no
      se elige ninguno). 100% propietario-only. Vista imprimible reutiliza
      `.doc-preview` sin `sign-row` (una nota interna no necesita firma)
- [x] Ventas con múltiples productos (función RPC `fn_registrar_venta`,
      no security definer, inserta venta + items en una transacción; el
      trigger `fn_venta_item_a_salida` genera automáticamente la salida en
      `mercaderia_movimientos` por cada item vendido — `cliente_id` en esa
      tabla queda reservado para estas salidas automáticas, el formulario
      manual de /mercaderia sigue sin exponerlo. Gap aceptado: si se borra
      una venta, la salida generada no se revierte sola, igual que el gap
      de combustible/gastos)
- [x] Control de Lechugas (esquema nuevo: `lechuga_variedades` +
      `lechuga_movimientos` + vista `lechuga_resumen`, mismo patrón de RLS
      que Mercadería — ambos roles ven/cargan movimientos, solo propietario
      gestiona el catálogo de variedades. Cada entrada registra su propia
      `fecha_vencimiento`; el estado Fresca/Por vencer se calcula sobre la
      última entrada de cada variedad, no por lote/FIFO — simplificación
      aceptada, mismo criterio que combustible/gastos)
- [ ] Facturación electrónica con BillPy — **en curso, aviso explícito
      recibido para empezar la base (sin conectar la API real todavía)**.
      Hecho: tabla `configuracion_facturacion` (datos del emisor + persona
      responsable de generación DE, propietario-only), columnas nuevas en
      `facturas_electronicas` (id_documento, link_qr, codigo_estado,
      descripcion_estado), Edge Function `armar-factura-billpy` (arma el
      JSON del formato BillPy y lo devuelve, sin llamar a la API — usa el
      JWT de quien invoca en vez de la service_role key, así las policies
      RLS de siempre deciden el acceso) y botón "Vista previa del envío"
      en /facturacion. Solo soporta ventas de contado (el grupo `credito`
      del JSON quedó afuera a pedido del cliente). Pendiente de confirmar
      con BillPy antes de conectar la llamada real: numeración de
      documento (¿la asigna BillPy o la llevamos nosotros?), varios
      códigos de `operacionComercial`/`receptor` (incluye
      `codUnidadMedida`, `receptor.tipoDocumento`, `ivaItem.afectacion` ya
      señalados por el cliente, más otros encontrados al armar el JSON:
      `version`, `condicionCambio`/`tipoCambio`/`condicionAnticipio`,
      `receptor.tipoOperacion`/`personaFisica`, `contadoEntrega.tipoPago`,
      `ivaItem.proporcion`/`tasa`), y datos que no existen en el esquema
      de `clientes` (persona física/jurídica, código de ciudad SIFEN,
      nombre de fantasía, celular). Todo queda marcado
      `// TODO: confirmar con BillPy` en el código de la función.
      Probado end-to-end en staging: el botón arma el JSON completo y los
      montos cuadran contra la venta real. **La fila actual de
      `configuracion_facturacion` es de prueba** (RUC ficticio
      `80000000-0`, `razon_social` marcada "DATOS DE PRUEBA") porque el
      timbrado real de Hugo todavía no está aprobado — hay que
      reemplazarla o borrarla antes de conectar la llamada real a BillPy,
      no hay ningún chequeo automático que lo impida. **Pendiente de
      resolver antes de conectar la API real**: confirmar si
      `facturas_electronicas` debe guardar su propia copia del RUC/datos
      del cliente al momento de emisión, en vez de depender de un join
      en vivo contra `clientes` — si no, editar el RUC de un cliente
      después reescribiría silenciosamente el RUC de facturas ya
      emitidas ante SIFEN, un dato que legalmente no debería cambiar
      retroactivamente. Hoy no aplica (nada se persiste todavía, todo
      es vista previa en vivo), pero hay que decidirlo antes de que haya
      facturas reales guardadas
- [x] Panel principal (franja de estadísticas con pestañas
      Hoy/Semana/Mes/Trimestre/Año — Facturado, Gastos, Ganancia Neta y
      Combustible, cada una comparada contra el período anterior con
      "mismos días transcurridos", no calendario completo, para no
      penalizar períodos parciales; ver `lib/periodos.ts`) + Accesos
      rápidos. El botón "Descargar resumen PDF" lleva a `/reportes/resumen`
      (ver ítem aparte más abajo) en vez de imprimir la pestaña activa.
      Ayudante ve una versión simple sin la franja financiera (sale de
      tablas propietario-only) — no es `<AccesoRestringido />`, es
      contenido distinto según el rol, ya que el Panel es la pantalla de
      inicio de ambos. "Clientes con saldo pendiente" y "Avisos en tiempo
      real" del mockup quedaron descartados a pedido del cliente, no
      forman parte del Panel
- [x] Reporte imprimible (`/reportes/resumen`, propietario-only): junta
      las 5 franjas del Panel en una tabla (no tarjetas tipo ticket, más
      cómodo para papel) más una sección de "Tendencia semanal" — últimas
      5 semanas **independientes y consecutivas** (no anidadas como las
      franjas del Panel) con Facturado/Gastos/Ganancia Neta, en un gráfico
      de barras hecho con CSS puro (sin librería — un gráfico sobre
      `<canvas>` imprime mal en varios navegadores). La lógica de cálculo
      compartida con el Panel vive en `lib/resumen-negocio.ts`
      (`calcularResumenPorPeriodos` y `calcularTendenciaSemanal`, ambas
      reciben el cliente de Supabase y la fecha de hoy, sin vistas ni RPC
      nuevas). El gráfico soporta Ganancia Neta negativa con una línea
      base proporcional (las barras negativas cuelgan hacia abajo en vez
      de recortarse)
- [x] Migrar Clientes al estilo visual definitivo (mismo patrón que
      Productos: `.card`/`.topbar`/`.badge`, sin tocar RLS ni consultas)
- [x] Aplicar diseño visual definitivo (mockups ya aprobados por el
      cliente) — todas las pantallas ya usan el sistema de diseño
- [ ] Editar/Eliminar (propuesta del cliente, punto 5) — **parcial**.
      Hecho: Stock (tipo `ajuste` nuevo en `mercaderia_movimientos`, con
      `motivo` obligatorio y cantidad con signo — solo `propietario` puede
      cargar ajustes, entrada/salida siguen abiertas a ambos roles; la
      vista `stock` ya sirve el ajuste en el cálculo), Mercadería (editar/
      eliminar movimientos, patrón `registroExistente`/`onGuardado`
      reutilizando el mismo formulario de alta) y Personal completo
      (empleados, bonos, vales, préstamos, notas — mismo patrón, más
      `components/eliminar-button.tsx` compartido que traduce el error de
      FK `23503` a un mensaje legible). `empleados` tiene 5 tablas
      dependientes sin cascada — borrar uno con pagos/bonos/vales/
      préstamos/notas falla a propósito, el mensaje sugiere marcarlo
      "inactivo" en su lugar (el formulario de edición ya incluye ese
      campo). Ventas también completo (ver más abajo, se hizo aparte con
      su propia lógica vía RPC en vez del patrón directo `.update()`/
      `.delete()`). Editar cliente entró junto con el punto 9, ver ese
      bullet. Sin eliminar clientes (no pedido, y tiene FK reales contra
      `ventas`/`mercaderia_movimientos`).
- [x] Editar/Eliminar en Ventas — necesitaba lógica distinta a los demás
      módulos por el trigger de salida automática a mercadería. Columna
      `venta_item_id` en `mercaderia_movimientos` (FK a `venta_items`,
      `on delete cascade`, `unique`) da trazabilidad real entre una venta
      y el movimiento de stock que generó — antes no existía ningún
      vínculo. `fn_venta_item_a_salida` ahora graba esa referencia al
      insertar. Dos RPC nuevas, mismo criterio que `fn_registrar_venta`
      (no `security definer`): `fn_editar_venta` (actualiza la venta,
      borra sus `venta_items` viejos — la cascada limpia sola los
      movimientos de stock vinculados — e inserta los nuevos, que
      generan movimientos frescos vía el trigger) y `fn_eliminar_venta`
      (borra la venta, la cascada revierte el stock). Las dos bloquean
      si la venta ya tiene una factura electrónica con `estado <>
      'pendiente'` (chequeo con `exists`, no `order by ... limit 1`, para
      no ignorar facturas viejas si alguna vez hay más de una fila por
      venta). UI: botones Editar/Eliminar en el historial de `/ventas`,
      ocultos (badge "Facturada") si ya está facturada — la RPC sigue
      siendo la única fuente de verdad real, el badge es solo UX
      preventiva. Probado en staging insertando y borrando a mano una
      fila de prueba en `facturas_electronicas`.
- [x] Mejoras en Clientes (propuesta del cliente, punto 9). Ficha
      individual en `/clientes/[id]` (muestra `telefono`, `direccion`,
      `correo`, `observaciones` — columnas que ya existían en la base
      desde la migración inicial pero que ningún formulario ni pantalla
      usaba hasta ahora); historial de compras de ese cliente (mismo
      cálculo `sum(subtotal) - descuento` que `/ventas`, filtrado por
      `cliente_id`, sin fórmula nueva); 4 tarjetas KPI (total facturado
      histórico, cantidad de compras, última compra, producto más
      comprado); vista nueva `cliente_producto_resumen` (agrupa
      `venta_items` por cliente+producto en la base, no en el frontend —
      "más comprado" definido por `cantidad_total` sumada, no por
      cantidad de ventas distintas, desempate por nombre); editar
      cliente con el mismo patrón `registroExistente`/`onGuardado` de
      siempre, con Observaciones fusionada en ese mismo formulario (no
      como campo aparte); ficha imprimible en `/clientes/[id]/imprimir`
      (mismo patrón `.doc-preview`/`<ImprimirButton>` de Notas/RRHH,
      historial acotado a las últimas 10 compras con aclaración visible
      del total real si el cliente tiene más — las estadísticas de
      arriba sí reflejan el historial completo, no solo lo impreso).
      **Nota deliberada**: "saldo pendiente" por cliente no es
      calculable — no existe tracking de pagos/cobros en el esquema,
      mismo motivo por el que se descartó del Panel principal. Sin
      eliminar cliente (no pedido).

## Mejoras pendientes de bajo riesgo
- Fijar `search_path` en `fn_registrar_venta`, `fn_venta_item_a_salida`,
  `fn_editar_venta` y `fn_eliminar_venta` — mismo patrón que ya se aplicó a
  las funciones de RRHH y perfiles. Pendiente, no bloqueante.
- Existe una vista `ventas_resumen` en la base, con el mismo cálculo que
  hoy se repite a mano en JS en `/ventas` y en la ficha de cliente —
  nunca se conectó a ninguna pantalla. Evaluar en un refactor futuro si
  conviene migrar esos cálculos a usar la vista en vez de `reduce()` en
  el frontend, para tener una sola fuente de verdad.
- Al editar una venta de un cliente que fue marcado como inactivo
  después, el selector de cliente en el formulario de edición no lo
  muestra entre las opciones (el array viene pre-filtrado a
  `estado='activo'` desde `ventas/page.tsx`) — el dato guardado en la
  venta no se corrompe, pero el dropdown puede verse en blanco o raro
  visualmente. Solución cuando se priorice: en modo edición, incluir
  explícitamente al cliente actual de la venta en las opciones del
  selector, aunque esté inactivo.

## Qué NO hacer sin preguntar primero
- No tocar el proyecto `hortimundo-produccion`.
- No conectar la llamada real a la API de BillPy todavía (la base —
  esquema + Edge Function que arma el JSON sin enviarlo — ya está permitida
  y construida, ver checklist).
- No auto-aceptar cambios en archivos de RLS, triggers o funciones con
  `security definer` sin revisión explícita línea por línea.
  ## Diseño visual de referencia
Los mockups aprobados por el cliente están en /design (archivos HTML
estáticos, no funcionales). Definen: paleta de colores, tipografía, estilo
de tarjetas tipo "ticket", sidebar de navegación, y la estructura de cada
pantalla (Panel, Clientes, Facturación, Personal, Cargar venta, Control de
Lechugas). Al construir cualquier pantalla nueva, seguir ese mismo lenguaje
visual desde el principio — no construir "feo" para después rediseñar.