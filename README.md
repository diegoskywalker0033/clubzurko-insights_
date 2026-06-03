# ClubZurko Insights

Dashboard interno de Reclutamiento y Marketing — Zurko Research.

## Despliegue en Vercel (sin instalar nada)

### Paso 1 — Sube el código a GitHub

1. Ve a **github.com** y crea una cuenta gratuita
2. Crea un nuevo repositorio: botón verde **"New"** → nombre: `clubzurko-insights` → **Create repository**
3. En la página del repositorio vacío, haz clic en **"uploading an existing file"**
4. Arrastra TODOS los archivos de esta carpeta (respetando la estructura de carpetas)
5. Haz clic en **"Commit changes"**

### Paso 2 — Despliega en Vercel

1. Ve a **vercel.com** → Sign up with GitHub
2. Haz clic en **"Add New Project"**
3. Selecciona el repositorio `clubzurko-insights`
4. Haz clic en **"Deploy"** (Vercel detecta Next.js automáticamente)
5. En 2 minutos tendrás una URL tipo `clubzurko-insights.vercel.app`

## Fuente de datos

La app incluye datos de demostración reales (741 proyectos de SEGUIMIENTO SEMANAL PROYECTOS).

Para cargar datos actualizados, usa el botón de upload en cualquier página y sube:
**`MÉTRICAS_PRESUPUESTO_Y_SEGUIMIENTO_DE_GASTOS.xlsx`**

## KPIs implementados (verificados contra ANÁLISIS TEMPORAL)

- Tasa asistencia = Asistentes / Reclutados
- Tasa inicios = Inicios / Reclutados  
- Tasa abandono = Abandonos / Reclutados
- Tasa exclusión = Exclusiones / Reclutados
- Tasa no válidos = No_validos / Reclutados
- Cumplimiento N = sum(Proyectoen_N) / count(Proyectos)
- Cumplimiento N+Extra = sum(Proyectoen_Nextra) / count(Proyectos)

## Páginas

- `/resumen` — Resumen ejecutivo + comparativa por sede
- `/reclutamiento` — KPIs, tasas, gráficas semanales, tabla de proyectos ✅
- `/captacion` — Próximamente
- `/base-datos` — Próximamente
- `/perfiles` — Próximamente
- `/presupuesto` — Próximamente
