// Datos de los 6 buyer persona de la base de voluntarios de Zurko Research
// Fuente: fichas_buyer_persona_zurko.docx + buyer_persona_zurko_documentocompleto.docx
// Modelo K-Means sobre 23.581 voluntarios (Madrid y Albacete, 19 años o más)
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export interface BuyerPersona {
  id: number
  nombre: string
  segmento: string
  cita: string
  personas: number
  activacion: number
  finalizacionGlobal: number
  finalizacionIndividual: number
  abandonoIndividual: number
  scoring: number
  necesidadesMedia: number
  quienEs: {
    edad: string
    sexo: string
    donde: string
    piel: string
  }
  necesidades: { label: string; valor: number }[]
  comoTrabajarlo: string[]
  idealPara: string[]
  interpretacion: string
  color: string
}

export const BUYER_PERSONAS: BuyerPersona[] = [
  {
    id: 0,
    nombre: 'Lucía',
    segmento: 'Imperfecciones y manchas',
    cita: 'Lo que más me molesta son las manchas y que el tono de mi piel no sea uniforme.',
    personas: 4284,
    activacion: 22.39,
    finalizacionGlobal: 54.78,
    finalizacionIndividual: 47.97,
    abandonoIndividual: 52.03,
    scoring: -2.86,
    necesidadesMedia: 5.7,
    quienEs: {
      edad: 'Joven: 8 de cada 10 tienen menos de 40 años',
      sexo: '3 de cada 4 son mujeres',
      donde: 'Madrid (90%) · Albacete (10%)',
      piel: 'Mixta y grasa, sensible',
    },
    necesidades: [
      { label: 'Pigmentación y manchas', valor: 100 },
      { label: 'Ojeras', valor: 93 },
      { label: 'Estrías', valor: 79 },
      { label: 'Acné', valor: 48 },
    ],
    comoTrabajarlo: [
      'Captar sin esfuerzo: responde bien a cualquier campaña.',
      'Reforzar recordatorios y seguimiento durante el estudio.',
      'Dejar los requisitos y las visitas muy claros antes de incluir.',
    ],
    idealPara: ['Antimanchas', 'Despigmentantes', 'Antiacné', 'Contorno de ojos', 'Uniformidad del tono', 'Estrías'],
    interpretacion: 'Es el segmento que más se activa de toda la base, pero también uno de los que peor termina: fácil de captar, difícil de retener.',
    color: '#B11C1F',
  },
  {
    id: 1,
    nombre: 'Marta',
    segmento: 'Cuidado esencial',
    cita: 'No tengo un problema concreto; busco productos que cuiden mi piel en el día a día.',
    personas: 5545,
    activacion: 19.60,
    finalizacionGlobal: 55.42,
    finalizacionIndividual: 52.29,
    abandonoIndividual: 47.71,
    scoring: -2.26,
    necesidadesMedia: 1.4,
    quienEs: {
      edad: 'Joven-media: 7 de cada 10 tienen menos de 40 años',
      sexo: 'El más equilibrado: 55% mujeres, 45% hombres',
      donde: 'Madrid (73%) · Albacete (27%), mayor peso de Albacete',
      piel: 'Mixta y normal, sensibilidad equilibrada',
    },
    necesidades: [
      { label: 'Ojeras', valor: 32 },
      { label: 'Pigmentación', valor: 19 },
      { label: 'Estrías', valor: 13 },
      { label: 'Hiperhidrosis', valor: 11 },
    ],
    comoTrabajarlo: [
      'Usarlo como base para protocolos con criterios amplios.',
      'Comunicar con mensajes sencillos y beneficio directo.',
      'Revisar la calidad del registro: parte de su "sin problemática" puede ser fichas incompletas.',
    ],
    idealPara: ['Hidratantes', 'Limpiadores', 'Higiene', 'Cosmética básica', 'Tolerancia en población general'],
    interpretacion: 'El grupo más numeroso y el que más estudios aporta en términos absolutos. No destaca en nada, y esa es su utilidad: sirve para casi todo.',
    color: '#8A1517',
  },
  {
    id: 2,
    nombre: 'Elena',
    segmento: 'Antiedad facial',
    cita: 'Empiezo a notar arrugas y ojeras y quiero un tratamiento que funcione de verdad.',
    personas: 3195,
    activacion: 20.78,
    finalizacionGlobal: 58.80,
    finalizacionIndividual: 54.40,
    abandonoIndividual: 45.60,
    scoring: -1.32,
    necesidadesMedia: 4.7,
    quienEs: {
      edad: 'La mayor de la base: 8 de cada 10 superan los 40 años',
      sexo: 'Paridad total: 50% mujeres, 50% hombres',
      donde: 'Madrid (90%) · Albacete (10%)',
      piel: 'Mixta y seca, tendencia a la sensibilidad',
    },
    necesidades: [
      { label: 'Arrugas', valor: 94 },
      { label: 'Ojeras', valor: 79 },
      { label: 'Pigmentación facial', valor: 78 },
      { label: 'Bolsas en los ojos', valor: 50 },
    ],
    comoTrabajarlo: [
      'Reservarlo para estudios largos o con varias visitas.',
      'Comunicar con argumento científico y resultado visible.',
      'Aprovechar su paridad de sexos si el protocolo exige hombres.',
    ],
    idealPara: ['Antiedad facial', 'Antiarrugas', 'Contorno de ojos', 'Reafirmantes faciales', 'Antimanchas'],
    interpretacion: 'Mejor tasa de finalización de los seis y perfil facial puro, casi sin necesidades corporales. Reservar para los estudios más exigentes.',
    color: '#D4292D',
  },
  {
    id: 3,
    nombre: 'Carmen',
    segmento: 'Firmeza corporal',
    cita: 'Lo que me preocupa es el cuerpo: la celulitis, las estrías y la falta de firmeza.',
    personas: 3622,
    activacion: 16.81,
    finalizacionGlobal: 58.43,
    finalizacionIndividual: 54.73,
    abandonoIndividual: 45.27,
    scoring: -1.14,
    necesidadesMedia: 4.7,
    quienEs: {
      edad: 'Intermedia: la mitad tiene entre 30 y 49 años',
      sexo: 'Casi exclusivamente femenino: 9 de cada 10',
      donde: 'Madrid (81%) · Albacete (19%)',
      piel: 'Mixta, sensibilidad repartida',
    },
    necesidades: [
      { label: 'Celulitis', valor: 89 },
      { label: 'Estrías', valor: 87 },
      { label: 'Flacidez', valor: 78 },
      { label: 'Varices', valor: 37 },
    ],
    comoTrabajarlo: [
      'Priorizar campañas específicas de captación corporal.',
      'Hablar de resultados visibles y medibles en el cuerpo.',
      'Aprovechar su perfil "limpio" para estudios con medición instrumental.',
    ],
    idealPara: ['Reafirmantes corporales', 'Anticelulíticos', 'Estrías', 'Remodelantes', 'Textura corporal'],
    interpretacion: 'La que menos se activa y, a la vez, la que mejor rinde cuando participa: mejor tasa individual y mejor scoring de los seis. El margen de mejora está en la captación.',
    color: '#6B1214',
  },
  {
    id: 4,
    nombre: 'Paula',
    segmento: 'Bienestar joven',
    cita: 'Llevo un ritmo alto; necesito productos prácticos para el día a día y la sudoración.',
    personas: 3542,
    activacion: 20.33,
    finalizacionGlobal: 58.21,
    finalizacionIndividual: 53.01,
    abandonoIndividual: 46.99,
    scoring: -1.74,
    necesidadesMedia: 4.1,
    quienEs: {
      edad: 'La más joven: más de la mitad tiene entre 19 y 29 años',
      sexo: '65% mujeres, 35% hombres',
      donde: 'Madrid (75%) · Albacete (25%)',
      piel: 'Mixta, mayoritariamente sensible',
    },
    necesidades: [
      { label: 'Ojeras', valor: 91 },
      { label: 'Estrías', valor: 86 },
      { label: 'Sudoración y olor', valor: 64 },
      { label: 'Hiperhidrosis', valor: 24 },
    ],
    comoTrabajarlo: [
      'Captar en canales digitales con mensajes cortos y directos.',
      'Asignarle estudios de corta o media duración.',
      'Usarlo como cantera para el tramo de 19 a 29 años.',
    ],
    idealPara: ['Desodorantes', 'Hiperhidrosis', 'Higiene corporal', 'Ojeras', 'Cosmética asociada al deporte'],
    interpretacion: 'Se activa por encima de la media y cumple por encima de la media. Vía natural de entrada al público más joven de la base.',
    color: '#E8474B',
  },
  {
    id: 5,
    nombre: 'Isabel',
    segmento: 'Antiedad integral',
    cita: 'Me preocupan muchas cosas a la vez, tanto del rostro como del cuerpo.',
    personas: 3393,
    activacion: 19.69,
    finalizacionGlobal: 45.24,
    finalizacionIndividual: 43.57,
    abandonoIndividual: 56.43,
    scoring: -5.12,
    necesidadesMedia: 8.0,
    quienEs: {
      edad: 'Madura: 7 de cada 10 superan los 40 años',
      sexo: 'El más femenino de los seis: más del 90%',
      donde: 'Madrid (91%) · Albacete (9%)',
      piel: 'Mixta y seca, mayoritariamente sensible',
    },
    necesidades: [
      { label: 'Ojeras', valor: 93 },
      { label: 'Celulitis', valor: 87 },
      { label: 'Estrías / pigment. / flacidez / arrugas', valor: 86 },
      { label: 'Bolsas en los ojos', valor: 56 },
    ],
    comoTrabajarlo: [
      'Filtrar más en la selección: disponibilidad, motivación y protocolo entendido.',
      'Mantener contacto cercano durante todo el estudio.',
      'Analizar sus causas de abandono antes de asignarle estudios largos.',
    ],
    idealPara: ['Rutinas antiedad completas', 'Nutricosmética', 'Premium', 'Tratamientos integrales'],
    interpretacion: 'Ocho necesidades por persona, el doble que la media. Único segmento donde los abandonos superan a las finalizaciones; scoring más bajo con diferencia.',
    color: '#4A0D0F',
  },
]

export const METODOLOGIA = {
  poblacion: '23.581 voluntarios · Madrid y Albacete · 19 años o más',
  tecnica: 'K-Means (no supervisado) sobre 17 variables de necesidades dermatológicas y cosméticas',
  nota: 'Los nombres son ficticios y sirven para facilitar la comunicación interna. Barcelona no forma parte de este modelo.',
}
