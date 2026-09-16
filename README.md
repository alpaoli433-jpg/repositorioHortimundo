# HortiMundo — Sistema de Gestión

Sistema de gestión (ERP) full-stack desarrollado para una empresa distribuidora hortofrutícola en Caacupé, Paraguay, que atiende alrededor de 15 clientes por día (supermercados). Reemplaza un proceso 100% manual (talonario físico) por un sistema digital completo en uso.

## Mi rol

Desarrollo end-to-end: arquitectura, base de datos, seguridad y control de calidad. Trabajé con Claude Code como copiloto de desarrollo, dirigiendo las decisiones de arquitectura, revisando cada cambio y validando manualmente cada módulo antes de darlo por terminado.

## Stack técnico

- Next.js (App Router) + TypeScript
- Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions)
- Despliegue en Vercel

## Módulos

Ventas multi-producto, Clientes, Productos, Inventario (mercadería, stock, merma), Combustible, Gastos, RRHH (empleados, aguinaldo, bonos, préstamos), Control de Lechugas, y Facturación electrónica (integración en progreso).

## Seguridad

- Row Level Security real en las 20 tablas del sistema, no solo protección a nivel de interfaz.
- Auditoría de seguridad completa: revisión manual, Supabase Security Advisor y escaneo externo con OWASP ZAP.
- Vulnerabilidades encontradas y corregidas: headers HTTP faltantes, Content Security Policy no configurada, y una vulnerabilidad de bypass de middleware resuelta mediante actualización del framework.
- El frontend solo utiliza la anon key de Supabase; la service role key nunca se expone al navegador.

## Decisiones de ingeniería destacadas

- Trazabilidad ventas-stock: se detectó que no existía forma de vincular un movimiento de inventario con la venta que lo originó. Se resolvió agregando una relación explícita y funciones RPC transaccionales (fn_editar_venta y fn_eliminar_venta) que revierten el stock correctamente al editar o eliminar una venta.
- Rendimiento: se diagnosticó latencia causada por la ubicación geográfica del servidor y se migró la infraestructura a una región más cercana, mejorando significativamente los tiempos de respuesta.

## Estado

Sistema validado en staging, con ventas, inventario y RRHH completos. Facturación electrónica en desarrollo, pendiente de aprobación del timbrado electrónico del cliente.
