export default function InicioPage() {
  const sections = [
    {
      icon: '📊',
      title: 'Resumen Ejecutivo',
      desc: 'Vista consolidada de los KPIs más importantes: BDD activa por sede, tasas de reclutamiento, alertas de retraso y tendencia semanal de solicitados, reclutados e inicios.',
    },
    {
      icon: '👥',
      title: 'Reclutamiento',
      desc: 'Análisis detallado del rendimiento de reclutamiento por semana, proyecto, departamento, tipo de estudio y cliente. Incluye semanas sobre objetivo N y N+Extra, tasas de asistencia, abandono y exclusión, gráficas de evolución y tabla exportable. También muestra el estado de retrasos con dos indicadores de tarta y el listado de estudios afectados.',
    },
    {
      icon: '🗄️',
      title: 'Base de Datos',
      desc: 'Seguimiento del crecimiento de la base de voluntarios activos por sede (Madrid, Albacete, Barcelona), evolución mensual de la BDD, altas semanales y desglose de perfiles especiales: fototipos, etnias, bebés e hijos.',
    },
    {
      icon: '📣',
      title: 'Captación',
      desc: 'Rendimiento de las acciones de captación de voluntarios: leads, altas, coste por alta (CPA) y coste por lead por mes, responsable, categoría y fuente. Seguimiento de la eficiencia de cada canal.',
    },
    {
      icon: '💶',
      title: 'Presupuesto',
      desc: 'Control de gasto real vs presupuesto 2026, dividido en dos bloques independientes: Pago a Voluntarios (remuneraciones IN VIVO por tipo de estudio) y Captación y Marketing (acciones de captación y merchandising).',
    },
    {
      icon: '📈',
      title: 'Comparativa SPLY',
      desc: 'Comparación con el mismo período del año anterior (2025). Δ en reclutados, inicios y altas BDD semana a semana, filtrable por sede.',
    },
    {
      icon: '🔬',
      title: 'Análisis por Dimensión',
      desc: 'Rendimiento desagregado por departamento, tipo de estudio o cliente. Filtra por departamento específico (Skincare, Haircare, Tolerancia, Solar…) y compara KPIs entre sí. Incluye comparativa 2025 vs 2026 por departamento con selector de métrica.',
    },
  ]

  const deptCards = [
    { dept: 'SKINCARE', color: 'bg-rose-50 border-rose-200 text-rose-700', icon: '✨', desc: 'Estudios de eficacia y seguridad en productos de cuidado facial y corporal: cremas, serums, contornos, parches y activos específicos.' },
    { dept: 'HAIRCARE', color: 'bg-purple-50 border-purple-200 text-purple-700', icon: '💆', desc: 'Estudios de eficacia y tolerancia en productos capilares: anticaída, anticanas, suplementos de regeneración y tratamientos.' },
    { dept: 'TOLERANCIA', color: 'bg-green-50 border-green-200 text-green-700', icon: '🛡️', desc: 'Estudios de seguridad y tolerancia cutánea: patch tests, HRIPTs y evaluaciones de compatibilidad dérmica.' },
    { dept: 'SOLAR', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: '☀️', desc: 'Estudios de protección solar: FPS, fotoestabilidad y eficacia en condiciones de exposición solar controlada.' },
    { dept: 'EFICACIA', color: 'bg-blue-50 border-blue-200 text-blue-700', icon: '🔬', desc: 'Estudios instrumentales de eficacia: medición objetiva de activos mediante equipos de análisis cutáneo.' },
    { dept: 'IN VITRO + IN VIVO', color: 'bg-indigo-50 border-indigo-200 text-indigo-700', icon: '🧪', desc: 'Estudios combinados de laboratorio e in vivo, con evaluación clínica e instrumental simultánea.' },
  ]

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-zurko-black to-zurko-dark p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red rounded-full opacity-10 translate-x-20 -translate-y-20"/>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-red rounded-full opacity-5 -translate-x-16 translate-y-16"/>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white font-bold text-xl">Z</div>
            <div>
              <p className="text-xs uppercase tracking-widest text-zurko-light">Zurko Research</p>
              <h1 className="text-2xl font-bold">ClubZurko Insights</h1>
            </div>
          </div>
          <p className="text-zurko-light text-base leading-relaxed max-w-2xl mb-6">
            Dashboard interno del Departamento de Voluntarios de Zurko Research. Centraliza el seguimiento de reclutamiento, base de datos, captación y presupuesto en tiempo real, permitiendo tomar decisiones basadas en datos para optimizar cada estudio cosmético.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[['928','Proyectos 2026'],['30.000+','Voluntarios activos'],['3','Sedes activas']].map(([v,l])=>(
              <div key={l} className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{v}</p>
                <p className="text-xs text-zurko-light mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Zurko Volunteers */}
      <div className="kpi-card mb-8">
        <h2 className="text-lg font-bold text-zurko-black mb-1">El Departamento de Voluntarios</h2>
        <div className="w-12 h-0.5 bg-brand-red mb-4"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-zurko-dark leading-relaxed mb-4">
              Zurko Research es una CRO (Contract Research Organization) especializada en estudios de eficacia y seguridad de productos cosméticos. El Departamento de Voluntarios es el motor que hace posible cada estudio: recluta, gestiona y fideliza a los panelistas que participan en evaluaciones clínicas e instrumentales.
            </p>
            <p className="text-sm text-zurko-dark leading-relaxed">
              La cosmética exige perfiles muy específicos: fototipos determinados, rangos de edad concretos, condiciones cutáneas particulares o características capilares definidas. Esto hace que el reclutamiento sea una disciplina de precisión: no basta con tener voluntarios, hay que tener los voluntarios correctos en el momento correcto.
            </p>
          </div>
          <div>
            <p className="text-sm text-zurko-dark leading-relaxed mb-4">
              La base de datos activa de más de 30.000 voluntarios —distribuidos entre Madrid, Albacete y Barcelona— es uno de los activos más valiosos de la compañía. Su crecimiento, diversidad y nivel de compromiso determinan directamente la capacidad de Zurko de asumir nuevos proyectos y cumplir plazos.
            </p>
            <p className="text-sm text-zurko-dark leading-relaxed">
              ClubZurko Insights permite al equipo monitorizar en tiempo real el rendimiento de cada estudio, identificar cuellos de botella, gestionar el presupuesto y demostrar al área comercial el valor diferencial del panel propio.
            </p>
          </div>
        </div>
      </div>

      {/* Departamentos */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-zurko-black mb-1">Departamentos de investigación</h2>
        <div className="w-12 h-0.5 bg-brand-red mb-4"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deptCards.map(d=>(
            <div key={d.dept} className={`rounded-xl p-4 border ${d.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{d.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider">{d.dept}</span>
              </div>
              <p className="text-xs leading-relaxed opacity-80">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sections guide */}
      <div>
        <h2 className="text-lg font-bold text-zurko-black mb-1">Secciones del dashboard</h2>
        <div className="w-12 h-0.5 bg-brand-red mb-4"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map(s=>(
            <div key={s.title} className="kpi-card flex gap-4">
              <span className="text-2xl shrink-0 mt-0.5">{s.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-zurko-black mb-1">{s.title}</h3>
                <p className="text-xs text-zurko-dark leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
