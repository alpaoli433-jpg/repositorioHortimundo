// Arma el JSON de facturación electrónica en el formato que espera BillPy.
// NO llama a la API de BillPy todavía — solo arma y devuelve el JSON para
// revisar a ojo. Ver CLAUDE.md: la conexión real queda pendiente de
// confirmación de códigos con el proveedor.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ==== Constantes confirmadas con BillPy ====
const TIPO_DE = 1
const TIPO_EMISION = 1
const TIPO_TRANSACCION = 1
const TIPO_IMPUESTO = 1
const COD_MONEDA = 'PYG'
const DESC_MONEDA = 'Guaraníes'

// ==== TODO: confirmar con BillPy ====
// Placeholders — no usar para emitir una factura real todavía.
const TODO_VERSION = 0 // TODO: confirmar con BillPy — versión del formato de lote
const TODO_INFO_EMISOR = '' // TODO: confirmar con BillPy — propósito de este campo
const TODO_NUMERO_DOCUMENTO = '0000000' // TODO: confirmar con BillPy — quién asigna la numeración (nosotros o BillPy)
const TODO_CONDICION_CAMBIO = 0 // TODO: confirmar con BillPy
const TODO_TIPO_CAMBIO = 0 // TODO: confirmar con BillPy
const TODO_CONDICION_ANTICIPIO = 0 // TODO: confirmar con BillPy
const TODO_RESPONSABLE_TIPO_DOCUMENTO = 0 // TODO: confirmar con BillPy (o completar configuracion_facturacion)
const TODO_TIPO_OPERACION_RECEPTOR = 0 // TODO: confirmar con BillPy
const TODO_PERSONA_FISICA = true // TODO: confirmar con BillPy — no existe esta distinción en clientes todavía
const TODO_TIPO_DOCUMENTO_RECEPTOR = 0 // TODO: confirmar con BillPy (pedido explícito del cliente)
const TODO_TIPO_PAGO = 0 // TODO: confirmar con BillPy — falta tabla de equivalencia con ventas.metodo_pago
const TODO_COD_UNIDAD_MEDIDA = 0 // TODO: confirmar con BillPy (pedido explícito del cliente)
const TODO_IVA_AFECTACION = 0 // TODO: confirmar con BillPy (pedido explícito del cliente)
const TODO_IVA_PROPORCION = 0 // TODO: confirmar con BillPy
const TODO_IVA_TASA = 0 // TODO: confirmar con BillPy — dato fiscal real (¿exenta o gravada?), no se asume

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { venta_id } = await req.json()

    if (!venta_id) {
      return new Response(JSON.stringify({ error: 'Falta venta_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { data: venta, error: errorVenta } = await supabase
      .from('ventas')
      .select('*, clientes(*)')
      .eq('id', venta_id)
      .single()

    if (errorVenta || !venta) {
      return new Response(JSON.stringify({ error: 'Venta no encontrada o sin permiso' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (venta.condicion_venta !== 'contado') {
      return new Response(
        JSON.stringify({
          error: 'Por ahora solo se arma el JSON para ventas de contado. El grupo "credito" no está incluido todavía.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: items, error: errorItems } = await supabase
      .from('venta_items')
      .select('*, productos(*)')
      .eq('venta_id', venta_id)

    if (errorItems || !items) {
      return new Response(JSON.stringify({ error: errorItems?.message ?? 'No se pudieron traer los items' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: config, error: errorConfig } = await supabase
      .from('configuracion_facturacion')
      .select('*')
      .limit(1)
      .single()

    if (errorConfig || !config) {
      return new Response(
        JSON.stringify({ error: 'Falta cargar configuracion_facturacion antes de poder armar el JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cliente = venta.clientes
    const totalVenta =
      items.reduce((acc: number, item: { subtotal: number }) => acc + Number(item.subtotal), 0) -
      Number(venta.descuento)

    const documento = {
      version: TODO_VERSION,
      infoEmisor: TODO_INFO_EMISOR,
      timbrado: {
        tipoDE: TIPO_DE,
        timbradoNumero: config.timbrado_numero,
        establecimiento: config.establecimiento,
        puntoExpedicion: config.punto_expedicion,
        numeroDocumento: TODO_NUMERO_DOCUMENTO,
        serie: config.serie,
        fechaInicio: new Date(config.fecha_inicio_vigencia).toISOString(),
      },
      camposGenerales: {
        tipoEmision: TIPO_EMISION,
        fechaEmision: new Date().toISOString(),
        operacionComercial: {
          tipoTransaccion: TIPO_TRANSACCION,
          tipoImpuesto: TIPO_IMPUESTO,
          codMoneda: COD_MONEDA,
          descMoneda: DESC_MONEDA,
          condicionCambio: TODO_CONDICION_CAMBIO,
          tipoCambio: TODO_TIPO_CAMBIO,
          condicionAnticipio: TODO_CONDICION_ANTICIPIO,
        },
        emisor: {
          responsableGeneracionDE: {
            tipoDocumento: config.responsable_tipo_documento ?? TODO_RESPONSABLE_TIPO_DOCUMENTO,
            numeroDocumento: config.responsable_numero_documento ?? '',
            nombreRazonSocial: config.responsable_nombre ?? '',
            cargo: config.responsable_cargo ?? '',
          },
        },
        receptor: {
          contribuyente: Boolean(cliente?.ruc),
          tipoOperacion: TODO_TIPO_OPERACION_RECEPTOR,
          codPais: 'PRY',
          descPais: 'Paraguay',
          personaFisica: TODO_PERSONA_FISICA,
          tipoDocumento: TODO_TIPO_DOCUMENTO_RECEPTOR,
          numeroDocumento: cliente?.ruc ?? '',
          nombreRazonSocial: cliente?.nombre ?? '',
          nombreFantasia: '',
          direccion: cliente?.direccion ?? '',
          numeroCasa: 0,
          codCiudad: 0,
          telefono: cliente?.telefono ?? '',
          celular: '',
          email: cliente?.correo ?? '',
          codCliente: cliente?.id ?? '',
        },
      },
      camposDE: {
        condicionOperacion: {
          contado: true,
          contadoEntrega: [
            {
              tipoPago: TODO_TIPO_PAGO,
              monto: totalVenta,
              codMoneda: COD_MONEDA,
              descMoneda: DESC_MONEDA,
            },
          ],
        },
        items: items.map((item: {
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          productos: { nombre: string; unidad: string } | null
        }) => ({
          codigo: item.producto_id,
          descripcion: item.productos?.nombre ?? '',
          codUnidadMedida: TODO_COD_UNIDAD_MEDIDA,
          descUnidadMedida: item.productos?.unidad ?? '',
          cantidad: Number(item.cantidad),
          valorItem: {
            precioUnitario: Number(item.precio_unitario),
            totalBruto: Number(item.subtotal),
          },
          ivaItem: {
            afectacion: TODO_IVA_AFECTACION,
            proporcion: TODO_IVA_PROPORCION,
            tasa: TODO_IVA_TASA,
            baseGravada: 0,
            liquidacion: 0,
          },
        })),
      },
      totalDocumento: {
        subtotalExenta: 0,
        subtotalIva5: 0,
        subtotalIva10: 0,
        totalGeneral: totalVenta,
        totalIva5: 0,
        totalIva10: 0,
        totalIva: 0,
        totalBaseGravada5: 0,
        totalBaseGravada10: 0,
      },
    }

    const payload = {
      id: 0,
      lote: [documento],
    }

    return new Response(JSON.stringify({ json: payload }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
