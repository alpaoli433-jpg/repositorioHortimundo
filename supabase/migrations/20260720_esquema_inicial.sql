-- ============================================================
-- HortiMundo — Migración inicial del esquema
-- Creado: Paso 1 del desarrollo (staging)
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLAS BASE
-- ------------------------------------------------------------

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  ruc text,
  telefono text,
  direccion text,
  correo text,
  estado text not null default 'activo',
  observaciones text,
  creado_en timestamptz not null default now()
);
alter table clientes enable row level security;

create table empleados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  documento text,
  cargo text,
  fecha_ingreso date,
  salario numeric(12,0) not null default 0,
  estado text not null default 'activo',
  observaciones text,
  creado_en timestamptz not null default now()
);
alter table empleados enable row level security;

create table productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  unidad text not null default 'kg',
  creado_en timestamptz not null default now()
);
alter table productos enable row level security;

create table mercaderia_movimientos (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id),
  cliente_id uuid references clientes(id),
  tipo text not null check (tipo in ('entrada', 'salida')),
  cantidad numeric(12,2) not null,
  proveedor text,
  fecha date not null default current_date,
  creado_en timestamptz not null default now()
);
alter table mercaderia_movimientos enable row level security;

create table merma (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id),
  cantidad numeric(12,2) not null,
  motivo text,
  fecha date not null default current_date,
  creado_en timestamptz not null default now()
);
alter table merma enable row level security;

create table gastos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  monto numeric(12,0) not null,
  descripcion text,
  fecha date not null default current_date,
  creado_en timestamptz not null default now()
);
alter table gastos enable row level security;

create table combustible (
  id uuid primary key default gen_random_uuid(),
  monto numeric(12,0) not null,
  litros numeric(8,2),
  vehiculo text,
  fecha date not null default current_date,
  creado_en timestamptz not null default now()
);
alter table combustible enable row level security;

create table salarios_pagados (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references empleados(id),
  monto numeric(12,0) not null,
  mes date not null,
  creado_en timestamptz not null default now()
);
alter table salarios_pagados enable row level security;

create table bonos (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references empleados(id),
  monto numeric(12,0) not null,
  motivo text,
  fecha date not null default current_date,
  creado_en timestamptz not null default now()
);
alter table bonos enable row level security;

create table vales_adelanto (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references empleados(id),
  monto numeric(12,0) not null,
  fecha date not null default current_date,
  observaciones text,
  creado_en timestamptz not null default now()
);
alter table vales_adelanto enable row level security;

create table prestamos (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references empleados(id),
  monto numeric(12,0) not null,
  condiciones text,
  fecha date not null default current_date,
  creado_en timestamptz not null default now()
);
alter table prestamos enable row level security;

create table ventas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id),
  fecha date not null default current_date,
  condicion_venta text not null default 'contado' check (condicion_venta in ('contado', 'credito')),
  metodo_pago text,
  descuento numeric(12,0) not null default 0,
  observaciones text,
  creado_en timestamptz not null default now()
);
alter table ventas enable row level security;

create table venta_items (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references ventas(id) on delete cascade,
  producto_id uuid not null references productos(id),
  cantidad numeric(12,2) not null,
  precio_unitario numeric(12,0) not null,
  subtotal numeric(14,0) generated always as (cantidad * precio_unitario) stored
);
alter table venta_items enable row level security;

create table facturas_electronicas (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid references ventas(id),
  numero_factura text,
  cdc text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  pdf_url text,
  emitida_en timestamptz,
  creado_en timestamptz not null default now()
);
alter table facturas_electronicas enable row level security;

create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  rol text not null default 'ayudante' check (rol in ('propietario', 'ayudante')),
  creado_en timestamptz not null default now()
);
alter table perfiles enable row level security;

-- ------------------------------------------------------------
-- 2. FUNCIONES Y TRIGGERS
-- ------------------------------------------------------------

create or replace function fn_combustible_a_gastos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into gastos (categoria, monto, descripcion, fecha)
  values (
    'combustible',
    new.monto,
    'Carga de combustible' || coalesce(' - ' || new.vehiculo, ''),
    new.fecha
  );
  return new;
end;
$$;

create trigger trg_combustible_a_gastos
after insert on combustible
for each row
execute function fn_combustible_a_gastos();

create or replace function fn_crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into perfiles (id, nombre, rol)
  values (new.id, new.raw_user_meta_data->>'nombre', 'ayudante');
  return new;
end;
$$;

create trigger trg_crear_perfil
after insert on auth.users
for each row
execute function fn_crear_perfil();

create or replace function fn_rol_actual()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select rol from perfiles where id = auth.uid();
$$;

-- Permisos: solo lo estrictamente necesario puede ejecutar estas funciones
revoke execute on function fn_combustible_a_gastos() from anon, authenticated;
revoke execute on function fn_crear_perfil() from anon, authenticated;
revoke execute on function fn_rol_actual() from anon;
grant execute on function fn_rol_actual() to authenticated;

-- ------------------------------------------------------------
-- 3. VISTAS (con security_invoker para respetar RLS)
-- ------------------------------------------------------------

create view stock as
select
  p.id as producto_id,
  p.nombre,
  p.unidad,
  coalesce(sum(case when m.tipo = 'entrada' then m.cantidad else 0 end), 0)
  - coalesce(sum(case when m.tipo = 'salida' then m.cantidad else 0 end), 0)
  as cantidad_disponible
from productos p
left join mercaderia_movimientos m on m.producto_id = p.id
group by p.id, p.nombre, p.unidad;
alter view stock set (security_invoker = true);

create view aguinaldo_estimado as
select
  e.id as empleado_id,
  e.nombre,
  extract(year from sp.mes) as anio,
  sum(sp.monto) as total_pagado_anio,
  round(sum(sp.monto) / 12) as aguinaldo_estimado
from empleados e
join salarios_pagados sp on sp.empleado_id = e.id
group by e.id, e.nombre, extract(year from sp.mes);
alter view aguinaldo_estimado set (security_invoker = true);

create view ventas_resumen as
select
  v.id as venta_id,
  v.cliente_id,
  v.fecha,
  v.condicion_venta,
  v.metodo_pago,
  coalesce(sum(vi.subtotal), 0) as subtotal_bruto,
  v.descuento,
  coalesce(sum(vi.subtotal), 0) - v.descuento as total
from ventas v
left join venta_items vi on vi.venta_id = v.id
group by v.id, v.cliente_id, v.fecha, v.condicion_venta, v.metodo_pago, v.descuento;
alter view ventas_resumen set (security_invoker = true);

-- ------------------------------------------------------------
-- 4. POLÍTICAS RLS
-- ------------------------------------------------------------

create policy "Propietario ve y gestiona clientes"
on clientes for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Todos pueden ver el catálogo de productos"
on productos for select
using (fn_rol_actual() in ('propietario', 'ayudante'));

create policy "Solo propietario gestiona el catálogo"
on productos for insert
with check (fn_rol_actual() = 'propietario');

create policy "Solo propietario modifica el catálogo"
on productos for update
using (fn_rol_actual() = 'propietario');

create policy "Solo propietario elimina del catálogo"
on productos for delete
using (fn_rol_actual() = 'propietario');

create policy "Ambos ven movimientos de mercadería"
on mercaderia_movimientos for select
using (fn_rol_actual() in ('propietario', 'ayudante'));

create policy "Ambos registran movimientos"
on mercaderia_movimientos for insert
with check (fn_rol_actual() in ('propietario', 'ayudante'));

create policy "Solo propietario corrige movimientos"
on mercaderia_movimientos for update
using (fn_rol_actual() = 'propietario');

create policy "Solo propietario borra movimientos"
on mercaderia_movimientos for delete
using (fn_rol_actual() = 'propietario');

create policy "Ambos ven merma"
on merma for select
using (fn_rol_actual() in ('propietario', 'ayudante'));

create policy "Ambos registran merma"
on merma for insert
with check (fn_rol_actual() in ('propietario', 'ayudante'));

create policy "Solo propietario corrige merma"
on merma for update
using (fn_rol_actual() = 'propietario');

create policy "Solo propietario borra merma"
on merma for delete
using (fn_rol_actual() = 'propietario');

create policy "Ambos ven combustible"
on combustible for select
using (fn_rol_actual() in ('propietario', 'ayudante'));

create policy "Ambos cargan combustible"
on combustible for insert
with check (fn_rol_actual() in ('propietario', 'ayudante'));

create policy "Solo propietario corrige combustible"
on combustible for update
using (fn_rol_actual() = 'propietario');

create policy "Solo propietario borra combustible"
on combustible for delete
using (fn_rol_actual() = 'propietario');

create policy "Solo propietario gestiona gastos"
on gastos for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Solo propietario gestiona empleados"
on empleados for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Solo propietario gestiona salarios"
on salarios_pagados for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Solo propietario gestiona bonos"
on bonos for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Solo propietario gestiona vales"
on vales_adelanto for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Solo propietario gestiona préstamos"
on prestamos for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Solo propietario gestiona ventas"
on ventas for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Solo propietario gestiona items de venta"
on venta_items for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Solo propietario gestiona facturas"
on facturas_electronicas for all
using (fn_rol_actual() = 'propietario')
with check (fn_rol_actual() = 'propietario');

create policy "Cada usuario ve su propio perfil"
on perfiles for select
using (id = auth.uid() or fn_rol_actual() = 'propietario');
