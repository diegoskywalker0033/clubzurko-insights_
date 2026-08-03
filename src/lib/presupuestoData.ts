// Datos reales de presupuesto 2026
// Fuente: MÉTRICAS_PRESUPUESTO_Y_SEGUIMIENTO_DE_GASTOS.xlsx → hoja "Gasto real 2026"

export interface CategoriaGasto {
  categoria: string
  presupuestoTotal: number
  presupuestoMes: number
  gastadoHastaHoy: number
  restante: number
  desviacionTotal: number
}

export const GASTO_2026: CategoriaGasto[] = [
  { categoria: 'Pago voluntarios', presupuestoTotal: 863472.10, presupuestoMes: 71956.01, gastadoHastaHoy: 309317.67, restante: 554154.43, desviacionTotal: -3174.07 },
  { categoria: 'In vivo — Eficacia Skincare', presupuestoTotal: 473314.05, presupuestoMes: 39442.84, gastadoHastaHoy: 142755, restante: 330559.05, desviacionTotal: 13038.70 },
  { categoria: 'In vivo — Eficacia Capilar', presupuestoTotal: 96400, presupuestoMes: 8033.33, gastadoHastaHoy: 27327, restante: 69073, desviacionTotal: 13673 },
  { categoria: 'In vivo — Seguridad', presupuestoTotal: 156602.49, presupuestoMes: 13050.21, gastadoHastaHoy: 73430, restante: 83172.49, desviacionTotal: -21660.10 },
  { categoria: 'In vivo — Solar', presupuestoTotal: 137155.56, presupuestoMes: 11429.63, gastadoHastaHoy: 65805.67, restante: 71349.89, desviacionTotal: -8225.67 },
  { categoria: 'Merchandising', presupuestoTotal: 1800, presupuestoMes: 150, gastadoHastaHoy: 479.37, restante: 1320.63, desviacionTotal: 613.22 },
  { categoria: 'Captación de voluntarios', presupuestoTotal: 25800, presupuestoMes: 2150, gastadoHastaHoy: 12018.97, restante: 13781.03, desviacionTotal: 2834.54 },
  { categoria: 'Captación digital', presupuestoTotal: 6000, presupuestoMes: 500, gastadoHastaHoy: 2914.79, restante: 3085.21, desviacionTotal: 923.12 },
  { categoria: 'Captación física', presupuestoTotal: 3000, presupuestoMes: 250, gastadoHastaHoy: 4866, restante: -1866, desviacionTotal: -2166 },
  { categoria: 'Programa embajadores', presupuestoTotal: 12000, presupuestoMes: 1000, gastadoHastaHoy: 1540, restante: 10460, desviacionTotal: 5080 },
  { categoria: 'Reclutamiento extra estudios + alianzas', presupuestoTotal: 4800, presupuestoMes: 400, gastadoHastaHoy: 2335, restante: 2465, desviacionTotal: -735 },
  { categoria: 'Sistemas', presupuestoTotal: 0, presupuestoMes: 0, gastadoHastaHoy: 363.18, restante: -363.18, desviacionTotal: -267.58 },
]

export const TOTAL_2026 = {
  presupuestoTotal: GASTO_2026.reduce((a, c) => a + c.presupuestoTotal, 0),
  gastadoHastaHoy: GASTO_2026.reduce((a, c) => a + c.gastadoHastaHoy, 0),
  restante: GASTO_2026.reduce((a, c) => a + c.restante, 0),
}

export interface ObjetivoSede {
  indicador: string
  madrid: number | string
  albacete: number | string
  bcn: number | string
  total: number | string
  unidad: '' | '%'
}

export const OBJETIVOS: ObjetivoSede[] = [
  { indicador: 'Captación', madrid: 2594, albacete: 968, bcn: 755, total: 4317, unidad: '' },
  { indicador: 'Tasa asistencia', madrid: 67.32, albacete: 74.89, bcn: 84.26, total: 73.40, unidad: '%' },
  { indicador: 'Tasa absentismo', madrid: 32.68, albacete: 25.11, bcn: 15.74, total: 26.60, unidad: '%' },
  { indicador: 'Reclutados', madrid: 9370, albacete: 7284, bcn: 4243, total: 20897, unidad: '' },
  { indicador: 'Iniciados', madrid: 4423, albacete: 4076, bcn: 2750, total: 11249, unidad: '' },
  { indicador: 'Tasa de conversión', madrid: 47, albacete: 55, bcn: 64, total: 53, unidad: '%' },
  { indicador: 'Sobrereclutamiento', madrid: 118, albacete: 78, bcn: 54, total: 85, unidad: '%' },
]
