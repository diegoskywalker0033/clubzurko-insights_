'use client'
import{useState}from'react'
import PageHeader from'@/components/PageHeader'
import{fmtNum}from'@/lib/kpis'
import{ResponsiveContainer,RadarChart,Radar,PolarGrid,PolarAngleAxis,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,LabelList}from'recharts'

const PERSONAS=[
  {id:1,nombre:'Lucía',subtitulo:'Imperfecciones y manchas',frase:'Lo que más me molesta son las manchas y que el tono de mi piel no sea uniforme.',n:4284,activacion:22.4,finalizacion:54.8,finalizacion_ind:48.0,color:'#e11d48',colorLight:'#fff1f2',
   quien:{edad:'Joven: 8 de cada 10 tienen menos de 40 años',sexo:'3 de cada 4 son mujeres',donde:'Madrid (90%) · Albacete (10%)',piel:'Mixta y grasa, sensible'},
   necesidades:[{n:'Pigmentación y manchas',p:100},{n:'Ojeras',p:93},{n:'Estrías',p:79},{n:'Acné',p:48}],
   como:'Es el segmento que más se activa de toda la base, pero también uno de los que peor termina: cuando cada persona cuenta igual, abandona más de la mitad.',
   trabajo:['Captar sin esfuerzo: responde bien a cualquier campaña.','Reforzar recordatorios y seguimiento durante el estudio.','Dejar los requisitos y las visitas muy claros antes de incluir.'],
   idealPara:['Antimanchas','Despigmentantes','Antiacné','Contorno de ojos','Uniformidad del tono','Estrías'],
   keywords:['manchas faciales','tono desigual','acné adulto','hiperpigmentación','ojeras','corrector tono'],
   canales:['Instagram (reel "manchas verano")','Meta leads','Base de datos filtrada','Captación digital joven'],
   buyerNegativo:['Personas con protocolo de más de 4 visitas','Estudios de larga duración (>3 meses)','Perfiles que requieren alta motivación sin seguimiento'],
   areasRelacionadas:['Dermatología estética','Cosmética con activos (vitamina C, niacinamida)','Protección solar antipigmentación']
  },
  {id:2,nombre:'Marta',subtitulo:'Cuidado esencial',frase:'No tengo un problema concreto; busco productos que cuiden mi piel en el día a día.',n:5545,activacion:19.6,finalizacion:55.4,finalizacion_ind:52.3,color:'#7c3aed',colorLight:'#f5f3ff',
   quien:{edad:'Joven-media: 7 de cada 10 tienen menos de 40 años',sexo:'El más equilibrado: 55% mujeres, 45% hombres',donde:'Madrid (73%) · Albacete (27%), el mayor peso de Albacete',piel:'Mixta y normal, con sensibilidad equilibrada'},
   necesidades:[{n:'Ojeras',p:32},{n:'Pigmentación',p:19},{n:'Estrías',p:13},{n:'Hiperhidrosis',p:11}],
   como:'Es el grupo más numeroso y el que más estudios aporta en términos absolutos. No destaca en nada, y esa es exactamente su utilidad: sirve para casi todo.',
   trabajo:['Usarlo como base para protocolos con criterios amplios.','Comunicar con mensajes sencillos y beneficio directo.','Revisar la calidad del registro: parte de su "sin problemática" pueden ser fichas incompletas.'],
   idealPara:['Hidratantes','Limpiadores','Higiene','Cosmética básica','Tolerancia en población general'],
   keywords:['rutina de piel','cuidado diario','hidratación','cosmética básica','piel sana','hombre cuidado piel'],
   canales:['Captación digital amplia','WhatsApp grupos','Base de datos sin filtro especial','Jobtoday','Alianzas generalistas'],
   buyerNegativo:['Estudios que requieren necesidad cutánea específica declarada','Protocolos con alta exigencia de motivación cosmética'],
   areasRelacionadas:['Dermatología preventiva','Cosmética de cuidado básico','Higiene personal','Hábitos de salud']
  },
  {id:3,nombre:'Elena',subtitulo:'Antiedad facial',frase:'Empiezo a notar arrugas y ojeras y quiero un tratamiento que funcione de verdad.',n:3195,activacion:20.8,finalizacion:58.8,finalizacion_ind:54.4,color:'#0891b2',colorLight:'#ecfeff',
   quien:{edad:'La mayor de la base: 8 de cada 10 superan los 40 años',sexo:'Paridad total: 50% mujeres, 50% hombres',donde:'Madrid (90%) · Albacete (10%)',piel:'Mixta y seca, con tendencia a la sensibilidad'},
   necesidades:[{n:'Arrugas',p:94},{n:'Ojeras',p:79},{n:'Pigmentación facial',p:78},{n:'Bolsas ojos',p:50}],
   como:'Mejor tasa de finalización de los seis y un perfil facial puro, casi sin necesidades corporales. Es el segmento al que conviene reservar los estudios más exigentes.',
   trabajo:['Reservarlo para estudios largos o con varias visitas.','Comunicar con argumento científico y resultado visible.','Aprovechar su paridad de sexos si el protocolo exige hombres.'],
   idealPara:['Antiedad facial','Antiarrugas','Contorno de ojos','Reafirmantes faciales','Antimanchas'],
   keywords:['antiarrugas','antiedad','retinol','ácido hialurónico','contorno de ojos','lifting facial'],
   canales:['Email a BDD >40 años','Alianzas con asociaciones de mayores','Meta audience 40+','Captación digital madura'],
   buyerNegativo:['Estudios de cuerpo sin componente facial','Protocolos de muy corta duración que no aprovechan su fiabilidad'],
   areasRelacionadas:['Dermatología antiaging','Medicina estética no invasiva','Bienestar 40+','Cosmética premium']
  },
  {id:4,nombre:'Carmen',subtitulo:'Firmeza corporal',frase:'Lo que me preocupa es el cuerpo: la celulitis, las estrías y la falta de firmeza.',n:3622,activacion:16.8,finalizacion:58.4,finalizacion_ind:54.7,color:'#d97706',colorLight:'#fffbeb',
   quien:{edad:'Intermedia: la mitad tiene entre 30 y 49 años',sexo:'Casi exclusivamente femenino: 9 de cada 10',donde:'Madrid (81%) · Albacete (19%)',piel:'Mixta, con sensibilidad repartida'},
   necesidades:[{n:'Celulitis',p:89},{n:'Estrías',p:87},{n:'Flacidez',p:78},{n:'Varices',p:37}],
   como:'La que menos se activa y, a la vez, la que mejor rinde cuando participa: mejor tasa individual y mejor scoring de los seis. El margen de mejora está en la captación.',
   trabajo:['Priorizar campañas específicas de captación corporal.','Hablar de resultados visibles y medibles en el cuerpo.','Aprovechar su perfil "limpio" para estudios con medición instrumental.'],
   idealPara:['Reafirmantes corporales','Anticelulíticos','Estrías','Remodelantes','Textura corporal'],
   keywords:['celulitis','estrías','reafirmante corporal','flacidez','anticelulítico','cuerpo verano'],
   canales:['Instagram reel "cuerpo"','Meta targeting mujeres 30-49','Captación física centros deportivos','Alianzas SPA/bienestar'],
   buyerNegativo:['Estudios con foco exclusivamente facial','Protocolos que no incluyan medición corporal objetiva'],
   areasRelacionadas:['Medicina estética corporal','Fisioterapia y masaje','Deporte y fitness','Cosmética corporal activa']
  },
  {id:5,nombre:'Paula',subtitulo:'Bienestar joven',frase:'Llevo un ritmo alto; necesito productos prácticos para el día a día y la sudoración.',n:3542,activacion:20.3,finalizacion:58.2,finalizacion_ind:53.0,color:'#059669',colorLight:'#ecfdf5',
   quien:{edad:'La más joven: más de la mitad tiene entre 19 y 29 años',sexo:'65% mujeres, 35% hombres',donde:'Madrid (75%) · Albacete (25%)',piel:'Mixta, mayoritariamente sensible'},
   necesidades:[{n:'Ojeras',p:91},{n:'Estrías',p:86},{n:'Sudoración y olor',p:64},{n:'Hiperhidrosis',p:24}],
   como:'Se activa por encima de la media y cumple por encima de la media. Es la vía natural de entrada al público más joven de la base y casi no registra pigmentación.',
   trabajo:['Captar en canales digitales con mensajes cortos y directos.','Asignarle estudios de corta o media duración.','Usarlo como cantera para el tramo de 19 a 29 años.'],
   idealPara:['Desodorantes','Hiperhidrosis','Higiene corporal','Ojeras','Cosmética asociada al deporte'],
   keywords:['desodorante eficaz','hiperhidrosis','sudoración excesiva','higiene deporte','ojeras cansancio','joven activo'],
   canales:['TikTok','Instagram stories','Jobtoday jóvenes','Universidad / campus','Meta 18-29'],
   buyerNegativo:['Estudios de larga duración (>2 meses) sin incentivo adicional','Protocolos que exijan >3 visitas sin flexibilidad horaria'],
   areasRelacionadas:['Deporte y rendimiento','Higiene personal activa','Bienestar joven','Cosmética sostenible y natural']
  },
  {id:6,nombre:'Isabel',subtitulo:'Antiedad integral',frase:'Me preocupan muchas cosas a la vez, tanto del rostro como del cuerpo.',n:3393,activacion:19.7,finalizacion:45.2,finalizacion_ind:43.6,color:'#dc2626',colorLight:'#fef2f2',
   quien:{edad:'Madura: 7 de cada 10 superan los 40 años',sexo:'El más femenino de los seis: más del 90%',donde:'Madrid (91%) · Albacete (9%)',piel:'Mixta y seca, mayoritariamente sensible'},
   necesidades:[{n:'Ojeras',p:93},{n:'Celulitis',p:87},{n:'Estrías / Arrugas',p:86},{n:'Bolsas ojos',p:56}],
   como:'Ocho necesidades por persona, el doble que la media. Es el único segmento en el que los abandonos superan a las finalizaciones, y su scoring medio es el más bajo.',
   trabajo:['Filtrar más en la selección: disponibilidad, motivación y protocolo entendido.','Mantener contacto cercano durante todo el estudio.','Analizar sus causas de abandono antes de asignarle estudios largos.'],
   idealPara:['Rutinas antiedad completas','Nutricosmética','Premium','Tratamientos integrales'],
   keywords:['antiedad completo','rutina antiedad','tratamiento integral','nutricosmética','antienvejecimiento mujer 50'],
   canales:['Email BDD >40 con múltiples necesidades','Alianzas farmacias','Meta mujeres 45+','Captación física clínicas estética'],
   buyerNegativo:['Estudios de alta duración sin protocolo de retención','Protocolos de más de 4 visitas sin compensación elevada','Estudios que requieran zona única sin necesidad compleja'],
   areasRelacionadas:['Medicina antienvejecimiento','Dermatología integral','Nutricosmética','Bienestar femenino 45+']
  }
]

function BarLabelPct({n,p}:{n:string;p:number}){
  return(<div className="mb-1.5"><div className="flex justify-between text-[11px] mb-0.5"><span className="text-zurko-dark">{n}</span><span className="font-bold">{p}%</span></div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-brand-red" style={{width:`${p}%`}}/></div></div>)
}

function PersonaCard({p,active,onClick}:{p:typeof PERSONAS[0];active:boolean;onClick:()=>void}){
  return(<div onClick={onClick} className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${active?'border-brand-red shadow-card-hover':'border-gray-100 bg-white hover:border-gray-200 shadow-card'}`} style={active?{borderColor:p.color}:{}}>
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{backgroundColor:p.color}}>{p.nombre[0]}</div>
      <div className="flex-1 min-w-0"><p className="font-bold text-sm text-zurko-black">{p.nombre}</p><p className="text-xs text-zurko-dark leading-tight">{p.subtitulo}</p></div>
      <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full shrink-0" style={{backgroundColor:p.color}}>{String(p.id).padStart(2,'0')}</span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center">
      <div><p className="text-xs font-bold" style={{color:p.color}}>{fmtNum(p.n)}</p><p className="text-[9px] text-zurko-dark">personas</p></div>
      <div><p className="text-xs font-bold text-zurko-black">{p.activacion}%</p><p className="text-[9px] text-zurko-dark">activación</p></div>
      <div><p className={`text-xs font-bold ${p.finalizacion<50?'text-red-600':'text-green-600'}`}>{p.finalizacion}%</p><p className="text-[9px] text-zurko-dark">finaliz.</p></div>
    </div>
  </div>)
}

export default function BuyerPersonaPage(){
  const[selected,setSelected]=useState(0)
  const p=PERSONAS[selected]
  const radarData=[
    {subject:'Activación',val:p.activacion/30*100},
    {subject:'Finalización',val:p.finalizacion},
    {subject:'Fin. individual',val:p.finalizacion_ind},
    {subject:'Tamaño segmento',val:p.n/5545*100},
  ]
  const necBar=p.necesidades.map(n=>({name:n.n.length>16?n.n.slice(0,16)+'…':n.n,pct:n.p}))

  return(<div className="p-6 max-w-[1400px]">
    <PageHeader title="Buyer Persona" subtitle="6 segmentos · K-Means sobre 23.581 voluntarios · Madrid y Albacete · 19+ años"/>
    <div className="mb-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
      <span>ℹ️</span><span>Los nombres son ficticios y sirven para comunicación interna. Datos del modelo estadístico de segmentación.</span>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 mt-4">
      {PERSONAS.map((per,i)=><PersonaCard key={per.id} p={per} active={selected===i} onClick={()=>setSelected(i)}/>)}
    </div>

    {/* Detalle del segmento seleccionado */}
    <div className="rounded-2xl border-2 p-6" style={{borderColor:p.color,backgroundColor:p.colorLight}}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0" style={{backgroundColor:p.color}}>{p.nombre[0]}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1"><h2 className="text-xl font-bold text-zurko-black">{p.nombre}</h2><span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{backgroundColor:p.color}}>{p.subtitulo}</span></div>
          <p className="text-sm italic text-zurko-dark">«{p.frase}»</p>
        </div>
        <div className="grid grid-cols-3 gap-3 shrink-0">
          {[['Personas',fmtNum(p.n)],[`Activación`,`${p.activacion}%`],[`Finalización`,`${p.finalizacion}%`]].map(([l,v])=><div key={l} className="bg-white rounded-xl px-4 py-3 text-center shadow-card"><p className="text-lg font-bold" style={{color:p.color}}>{v}</p><p className="text-[10px] text-zurko-dark uppercase tracking-wider mt-0.5">{l}</p></div>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quién es */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zurko-dark mb-3">👤 Quién es</h3>
          <div className="space-y-2 text-xs">
            {Object.entries(p.quien).map(([k,v])=><div key={k} className="flex gap-2"><span className="text-zurko-light shrink-0 capitalize">{k}:</span><span className="font-medium">{v}</span></div>)}
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zurko-dark mb-2">📊 Participación</h3>
            <div className="space-y-1 text-xs">
              {[['Activación global',p.activacion+'%'],['Finalización global',p.finalizacion+'%'],['Finalización individual',p.finalizacion_ind+'%']].map(([l,v])=><div key={l} className="flex justify-between"><span className="text-zurko-dark">{l}</span><span className="font-bold">{v}</span></div>)}
            </div>
          </div>
        </div>

        {/* Necesidades + radar */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zurko-dark mb-3">💆 Necesidades declaradas</h3>
          {p.necesidades.map(n=><BarLabelPct key={n.n} n={n.n} p={n.p}/>)}
          <h3 className="text-xs font-bold uppercase tracking-wider text-zurko-dark mt-4 mb-2">🎯 Ideal para</h3>
          <div className="flex flex-wrap gap-1">{p.idealPara.map(t=><span key={t} className="text-[10px] px-2 py-0.5 rounded-full border" style={{color:p.color,borderColor:p.color,backgroundColor:p.colorLight}}>{t}</span>)}</div>
        </div>

        {/* Cómo trabajarlo */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zurko-dark mb-3">⚡ Cómo participar</h3>
          <p className="text-xs text-zurko-dark leading-relaxed mb-3">{p.como}</p>
          <ul className="space-y-1.5">{p.trabajo.map((t,i)=><li key={i} className="flex gap-2 text-xs"><span style={{color:p.color}} className="font-bold shrink-0">—</span><span>{t}</span></li>)}</ul>
        </div>
      </div>

      {/* Keywords, canales, buyer negativo, áreas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zurko-dark mb-3">🔑 Keywords de captación</h3>
          <div className="flex flex-wrap gap-1.5">{p.keywords.map(k=><span key={k} className="text-[10px] bg-gray-100 text-zurko-dark px-2 py-0.5 rounded-full">{k}</span>)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zurko-dark mb-3">📣 Canales recomendados</h3>
          <ul className="space-y-1">{p.canales.map((c,i)=><li key={i} className="text-xs flex gap-2"><span style={{color:p.color}}>•</span>{c}</li>)}</ul>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3">🚫 Buyer negativo</h3>
          <ul className="space-y-1">{p.buyerNegativo.map((b,i)=><li key={i} className="text-xs flex gap-2"><span className="text-red-500">✗</span>{b}</li>)}</ul>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zurko-dark mb-3">🔗 Áreas relacionadas</h3>
          <div className="flex flex-wrap gap-1.5">{p.areasRelacionadas.map((a,i)=><span key={i} className="text-[10px] border border-gray-200 text-zurko-dark px-2 py-0.5 rounded-full">{a}</span>)}</div>
        </div>
      </div>
    </div>

    {/* Comparativa de los 6 */}
    <div className="mt-8">
      <h3 className="text-sm font-bold text-zurko-black mb-4">Comparativa de los 6 segmentos</h3>
      <div className="kpi-card">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={PERSONAS.map(per=>({name:per.nombre,Activación:per.activacion,'Finaliz. global':per.finalizacion,'Finaliz. individual':per.finalizacion_ind}))} barGap={2} barCategoryGap="20%" margin={{top:20}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
            <Tooltip formatter={(v:number)=>`${v}%`}/><Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="Activación" fill="#C6C6C6" radius={[2,2,0,0]}><LabelList dataKey="Activación" position="top" style={{fontSize:9,fill:'#505050'}}/></Bar>
            <Bar dataKey="Finaliz. global" fill="#B11C1F" radius={[2,2,0,0]}><LabelList dataKey="Finaliz. global" position="top" style={{fontSize:9,fill:'#B11C1F',fontWeight:600}}/></Bar>
            <Bar dataKey="Finaliz. individual" fill="#505050" radius={[2,2,0,0]}><LabelList dataKey="Finaliz. individual" position="top" style={{fontSize:9,fill:'#505050'}}/></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
        {PERSONAS.map(per=><div key={per.id} className="kpi-card text-center"><div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm" style={{backgroundColor:per.color}}>{per.nombre[0]}</div><p className="text-xs font-bold">{fmtNum(per.n)}</p><p className="text-[9px] text-zurko-dark">voluntarios</p><p className="text-xs font-bold text-brand-red mt-1">{per.finalizacion}%</p><p className="text-[9px] text-zurko-dark">finaliz.</p></div>)}
      </div>
    </div>
  </div>)
}
