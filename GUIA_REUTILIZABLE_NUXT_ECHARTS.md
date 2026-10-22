# Guía reutilizable · Presentaciones con Nuxt SSR y ECharts

Esta guía recoge la arquitectura y las decisiones visuales útiles de `slidev-vbg`, pero las adapta a una presentación más compleja hecha con **Nuxt y SSR**. Está pensada para copiarse a la carpeta raíz de un proyecto nuevo y usarla como contexto de trabajo.

## Objetivo

Construir una presentación web con narrativa, transiciones y visuales propios, conservando SSR para el contenido, SEO y carga inicial. Las gráficas interactivas de ECharts se renderizan solo en el navegador: el servidor entrega su espacio reservado y el cliente las inicializa al hidratar.

## Principios que vale la pena conservar

- Cada diapositiva comunica una idea; una gráfica solo entra si ayuda a entenderla.
- El título explica qué se está viendo: unidad, territorio, periodo y población deben estar claros dentro de la diapositiva, no solo en una nota pequeña.
- Los datos, la configuración de cada gráfica y sus fuentes viven juntos; no se mezclan en un componente gigante.
- Animar con propósito: entrada del dato, revelado progresivo y transiciones suaves. Evitar que la gráfica aparezca completa antes de animarse.
- Reservar altura y anchura para las gráficas desde el SSR para evitar saltos visuales al hidratar.
- Cuidar accesibilidad: contraste, texto alternativo, fuente del dato y una lectura textual equivalente para información importante.

## Arquitectura sugerida

```text
mi-presentacion/
├── app.vue
├── nuxt.config.ts
├── pages/
│   └── index.vue                     # Navegación y estado de la presentación
├── components/
│   ├── presentation/
│   │   ├── PresentationShell.vue     # Teclado, paginación, transiciones
│   │   ├── SlideFrame.vue            # Lienzo, fondo, logo y número
│   │   └── charts/
│   │       └── EChartClient.vue      # Adaptador reutilizable ECharts
│   └── slides/
│       ├── Slide01Cover.vue
│       ├── Slide02Problem.vue
│       └── Slide03Data.vue
├── content/
│   └── slides.ts                     # Orden, título, metadatos y notas
├── data/
│   ├── charts/
│   │   ├── violence-by-region.ts
│   │   └── violence-by-region.md     # Documento propio de ESTA gráfica
│   └── sources/
│       └── sources.ts
├── composables/
│   ├── usePresentation.ts
│   ├── useEChart.ts
│   └── useReducedMotion.ts
├── assets/
│   ├── css/tokens.css
│   └── images/
├── public/
│   └── slides/                       # Imagen o recurso específico por slide
│       └── 03-problematica/
└── docs/
    ├── design-system.md
    └── charts/                       # Índice/decisiones comunes de gráficas
```

### Regla de oro para gráficas

**Una gráfica = cuatro archivos mínimos**:

```text
data/charts/nombre-de-la-grafica.ts    # Datos normalizados y opción ECharts
data/charts/nombre-de-la-grafica.md    # Ficha: sentido, fuente, fecha, límites
components/charts/NombreDeLaGrafica.vue # Solo su presentación/interacción
public/slides/NN-slug/                 # Recursos visuales exclusivos del slide
```

El componente global `EChartClient.vue` no debe contener datos de una gráfica concreta. Su trabajo es inicializar, redimensionar, actualizar y destruir una instancia.

## Ficha obligatoria por gráfica

Crear `data/charts/nombre-de-la-grafica.md` para **cada** visual. Plantilla:

```md
# Nombre legible de la gráfica

## Pregunta que responde

¿Qué debe entender la audiencia al verla?

## Afirmación principal

Una frase completa, verificable y sin exagerar la evidencia.

## Datos

- Indicador y unidad:
- Territorio:
- Periodo:
- Población o universo:
- Desagregaciones:

## Fuente primaria

- Entidad:
- Enlace directo:
- Fecha de consulta:
- Archivo/base/tabla original:

## Transformaciones

- Filtros, agregaciones, cálculos de tasa, redondeos o datos excluidos.
- Código que realiza cada transformación.

## Límites de interpretación

- Qué NO permite concluir la gráfica.
- Subregistro, cambio metodológico, datos faltantes o categorías no comparables.

## Diseño e interacción

- Tipo de gráfica y por qué.
- Colores y significado.
- Tooltip, leyenda, clics y estado inicial.
- Animación de entrada y duración.

## Accesibilidad

- Texto alternativo / resumen textual.
- Contraste y alternativa para no depender solo del color.
```

Esto evita el problema habitual de no saber después de dónde salió una barra, qué significa una leyenda o por qué dos cifras no coinciden.

## Nuxt SSR + ECharts: patrón seguro

ECharts necesita un DOM y un contenedor con dimensiones; por eso no debe inicializarse durante SSR. Nuxt ofrece `<ClientOnly>` para aislar contenido que solo puede existir en el navegador.

En el slide o página, reservar el espacio desde el servidor:

```vue
<template>
  <ClientOnly>
    <NombreDeLaGrafica />
    <template #fallback>
      <div class="chart-placeholder" aria-label="Cargando gráfica" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.chart-placeholder { min-height: 26rem; width: 100%; }
</style>
```

Adaptador reusable (`components/presentation/charts/EChartClient.vue`):

```vue
<script setup lang="ts">
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  option: EChartsOption
  ariaLabel: string
}>()

const host = ref<HTMLDivElement | null>(null)
let chart: import('echarts/core').ECharts | undefined
let observer: ResizeObserver | undefined

onMounted(async () => {
  if (!host.value) return

  const { init } = await import('echarts/core')
  chart = init(host.value, undefined, { renderer: 'canvas' })
  chart.setOption(props.option, { notMerge: true })

  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(host.value)
})

watch(() => props.option, (option) => {
  chart?.setOption(option, { notMerge: true })
}, { deep: true })

onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
})
</script>

<template>
  <div ref="host" class="e-chart" role="img" :aria-label="ariaLabel" />
</template>

<style scoped>
.e-chart { width: 100%; min-height: 26rem; }
</style>
```

Notas:

- Para reducir el bundle, importar solo los módulos de ECharts que la gráfica necesita (`BarChart`, `LineChart`, `TooltipComponent`, etc.) y registrarlos con `use()`. Una alternativa simple es `import('echarts')`, pero pesa más.
- `ResizeObserver` responde a cambios reales del contenedor; `window.resize` no cubre por sí solo cambios de layout, paneles o la entrada de una diapositiva.
- Ejecutar `dispose()` al desmontar. Si un slide sale y vuelve a entrar, se crea una instancia limpia, sin memoria ni animaciones arrastradas.
- Si una gráfica debe verse también en la primera pintura SSR, ECharts permite SSR a SVG, pero para una exposición interactiva normalmente resulta más simple y robusto reservar el espacio y usar `<ClientOnly>`.

La necesidad de contenedor con tamaño, `resize()` y `dispose()` está documentada por [Apache ECharts](https://echarts.apache.org/handbook/en/concepts/chart-size/). La alternativa de ECharts SSR con SVG se documenta [aquí](https://apache.github.io/echarts-handbook/en/how-to/cross-platform/server/).

## Componente específico de una gráfica

Ejemplo de archivo mínimo: `components/charts/ViolenceByRegionChart.vue`.

```vue
<script setup lang="ts">
import { option, chartSummary } from '~/data/charts/violence-by-region'
</script>

<template>
  <EChartClient :option="option" :aria-label="chartSummary" />
</template>
```

La opción y los datos están fuera del componente visual:

```ts
// data/charts/violence-by-region.ts
import type { EChartsOption } from 'echarts'

export const chartSummary =
  'Tasa por 100.000 habitantes en regiones seleccionadas, 2024.'

export const option: EChartsOption = {
  animationDuration: 900,
  animationEasing: 'cubicOut',
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['Región A', 'Región B'] },
  yAxis: { type: 'value', name: 'Tasa por 100.000 habitantes' },
  series: [{ type: 'bar', data: [12.4, 24.1] }],
}
```

## Animación y navegación

- Mantener la animación de series de ECharts entre **700 y 1.000 ms**; es suficiente para percibir un crecimiento de barras o líneas sin frenar el relato.
- Inicializar la gráfica cuando la diapositiva entra, no antes. Si queda montada y solo se oculta, la audiencia verá un estado ya terminado.
- Para cifras grandes, usar un componente `AnimatedNumber` separado; iniciar el contador cuando el slide se active y respetar `prefers-reduced-motion`.
- Separar dos conceptos: **transición entre slides** (CSS/Vue) y **animación interna del dato** (ECharts). No depender de una para producir la otra.
- Ofrecer navegación por teclado: `ArrowRight`, `ArrowLeft`, `Space`, `Home`, `End`, más botones visibles para pantalla táctil.

## Diseño que se puede trasladar desde esta presentación

- Definir tokens de color y tipografía en un solo archivo; no poner hexadecimales dispersos en cada gráfico.
- Dar a cada slide un directorio de recursos: `public/slides/NN-slug/` con un `README.md` que diga qué imagen falta, licencia, crédito y fuente.
- Usar pie de diapositiva consistente: logo, número de slide y fuente solo cuando aporta contexto. Evitar repetir una fuente que ya se lee en el título o en la propia gráfica.
- Las tarjetas, preguntas y notas deben tener jerarquía visual estable: pregunta → dato/idea → límite o invitación a pensar.
- No usar color como único significado. Por ejemplo, acompañar una serie de “mujeres” y “hombres” con leyenda clara, patrón o etiquetas si el caso lo requiere.

## Checklist antes de publicar

- [ ] Cada gráfica tiene su `.ts` y su `.md` de ficha.
- [ ] Cada título dice qué, dónde, cuándo y en qué unidad se mide.
- [ ] La fuente está enlazada y la transformación de datos se puede reconstruir.
- [ ] Ninguna visual sugiere causalidad cuando solo muestra asociación o conteo.
- [ ] Las gráficas tienen altura explícita y no cambian de tamaño al aparecer.
- [ ] ECharts solo se inicializa en cliente; no hay acceso a `window` o DOM durante SSR.
- [ ] Cada instancia usa `resize()` y `dispose()` correctamente.
- [ ] La vista móvil, proyector 16:9 y pantalla ancha fueron revisadas.
- [ ] Las animaciones respetan `prefers-reduced-motion`.
- [ ] Las imágenes tienen créditos/licencia y texto alternativo significativo.

## Al iniciar el próximo proyecto

1. Copiar este archivo a la nueva raíz.
2. Traer el sistema de tokens, el `AnimatedNumber` y solo los componentes que realmente se quieran reutilizar.
3. Crear la estructura `data/charts/` y `docs/charts/` antes de escribir la primera gráfica.
4. Definir primero el guion: una afirmación por slide; después elegir la gráfica adecuada.
5. Crear la ficha `.md` de cada gráfica antes o junto con su implementación.
6. Pedir explícitamente: “Crea la presentación Nuxt SSR siguiendo `GUIA_REUTILIZABLE_NUXT_ECHARTS.md`”.

