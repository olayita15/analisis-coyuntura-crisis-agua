<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
// Componente regional independiente para que Slidev pueda recargarlo por HMR.

const mapUrl = (file: string) => `${import.meta.env.BASE_URL}data/maps/${file}`

type GeoJson = { type: 'FeatureCollection'; features: Array<{ type: 'Feature'; properties?: Record<string, unknown>; geometry: { coordinates: unknown } }> }
type Layer = 'affectation' | 'alerts' | 'projects'
type Evidence = { layer: Layer; level: number; label: string; impact: string; response: string; date: string; url: string }
const links = {
  alerts: 'https://www.cundinamarca.gov.co/noticias/cundinamarca-se-une-a-las-medidas-de-racionamiento-de-agua-implementadas-en-bogota',
  projects: 'https://www.cundinamarca.gov.co/noticias/cundinamarca-busca-nuevas-fuentes-de-agua-en-16-municipios-con-inversion-superior-a-12240-millones',
}
const evidence: Record<string, Evidence> = {
  'BOGOTÁ D.C.': { layer: 'alerts', level: 2, label: 'Racionamiento documentado', impact: 'Bajos niveles de Chingaza durante la sequía de 2024.', response: 'Turnos de restricción de 24 horas; la medida fue levantada en abril de 2025.', date: '10 abr. 2024', url: 'https://bogota.gov.co/mi-ciudad/habitat/racionamiento-de-agua-en-bogota-jueves-11-de-abril-inician-medidas' },
  'Facatativá': { layer: 'affectation', level: 3, label: 'Afectación de abastecimiento documentada', impact: 'Dificultades de abastecimiento con atención de contingencia.', response: 'Carrotanques; pozos Cartagenita y La Guapucha en ejecución. La Guapucha: 70 % y 433 m; tercera fuente proyectada en Tierra Grata.', date: '03 sep. 2026', url: 'https://www.cundinamarca.gov.co/noticias/cundinamarca-destina-cerca-de-20000-millones-para-ampliar-las-fuentes-de-agua-y-mejorar-el-abastecimiento-en-facatativa/' },
  'Madrid': { layer: 'affectation', level: 3, label: 'Continuidad del servicio documentada', impact: 'Problemas de continuidad en Puente Piedra.', response: 'Servicio restablecido provisionalmente en abril de 2026 por bombeo desde pozo profundo; capacidad de diseño hasta 20 L/s. Pozo definitivo en avance.', date: '30 abr. 2026', url: 'https://www.cundinamarca.gov.co/noticias/puente-piedra-recupera-el-servicio-de-agua-y-avanza-a-solucion-definitiva-del-pozo-con-74--de-ejecucion/' },
}
for (const name of ['Cajicá', 'Chía', 'Cota', 'Funza', 'Gachancipá', 'La Calera', 'Mosquera', 'Soacha', 'Sopó', 'Tocancipá']) evidence[name] = { layer: 'alerts', level: 2, label: 'Racionamiento documentado', impact: 'Restricción asociada a la crisis hídrica y dependencia del suministro distrital.', response: 'Suspensión de 24 horas rotativa cada nueve días. El municipio también fue incluido en el programa de exploración de fuentes.', date: '20 sep. 2024 / 10 jun. 2026', url: links.alerts }
for (const name of ['Sesquilé', 'Tabio', 'Bojacá', 'El Rosal', 'Zipacón']) evidence[name] = { layer: 'projects', level: 1, label: 'Exploración de aguas subterráneas', impact: 'La fuente no confirma desabastecimiento local.', response: 'Perforaciones exploratorias, pruebas hidráulicas y análisis de calidad para determinar viabilidad de una fuente.', date: '10 jun. 2026', url: links.projects }

const show = ref({ affectation: true, alerts: true, projects: true })
const el = ref<HTMLDivElement>()
const state = ref('Cargando límites territoriales…')
let chart: echarts.ECharts | undefined
let observer: ResizeObserver | undefined
let ready = false
const allPoints = (value: unknown, output: [number, number][] = []): [number, number][] => {
  if (Array.isArray(value) && typeof value[0] === 'number') output.push(value as [number, number])
  else if (Array.isArray(value)) value.forEach(item => allPoints(item, output))
  return output
}
function update() {
  chart?.setOption({ series: [{ roam: true, scaleLimit: { min: .8, max: 8 }, data: Object.entries(evidence).filter(([, item]) => show.value[item.layer]).map(([name, item]) => ({ name, value: item.level })) }] })
}
function tip(name: string) {
  const item = evidence[name]
  if (!item) return `<b>${name}</b><br/><span style="color:#afbfba">Pendiente: no hay evidencia municipal desagregada verificable incorporada para asignar un nivel.</span>`
  return `<b>${name}</b><br/><span style="color:#dfbb72">${item.label}</span><br/><br/><b>Afectación:</b> ${item.impact}<br/><b>Respuesta:</b> ${item.response}<br/><br/><a href="${item.url}" target="_blank" style="color:#86c8c0">Fuente oficial · ${item.date} ↗</a>`
}
async function render() {
  if (ready || !el.value || !el.value.clientWidth) return
  ready = true
  try {
    const cache = globalThis as typeof globalThis & { __ejeRegionalMap?: GeoJson }
    let mapData = cache.__ejeRegionalMap
    if (!mapData) {
      const [cundinamarca, bogota] = await Promise.all([
        fetch(mapUrl('cundinamarca-municipios.geojson')).then(r => r.json() as Promise<GeoJson>),
        fetch(mapUrl('bogota-distrito.geojson')).then(r => r.json() as Promise<GeoJson>),
      ])
      const raw = [...cundinamarca.features, ...bogota.features]
      const positions = raw.flatMap(feature => allPoints(feature.geometry.coordinates))
      const bounds = positions.reduce((result, point) => ({ minX: Math.min(result.minX, point[0]), maxX: Math.max(result.maxX, point[0]), minY: Math.min(result.minY, point[1]), maxY: Math.max(result.maxY, point[1]) }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity })
      const cx = (bounds.minX + bounds.maxX) / 2, cy = (bounds.minY + bounds.maxY) / 2
      const rotate = (value: unknown): unknown => Array.isArray(value) && typeof value[0] === 'number'
        ? [cx - ((value[1] as number) - cy), cy + ((value[0] as number) - cx)]
        : (value as unknown[]).map(rotate)
      mapData = { type: 'FeatureCollection', features: raw.map(feature => ({ ...feature, properties: { ...feature.properties, name: feature.properties?.MpNombre ?? feature.properties?.MunNombre }, geometry: { ...feature.geometry, coordinates: rotate(feature.geometry.coordinates) } })) }
      cache.__ejeRegionalMap = mapData
    }
    echarts.registerMap('region-bogota-cundinamarca', mapData!)
    chart = echarts.init(el.value)
    chart.setOption({
      animationDuration: 650,
      tooltip: { trigger: 'item', confine: true, backgroundColor: '#0c1417', borderColor: '#526665', textStyle: { color: '#f3f0e7', fontSize: 10 }, extraCssText: 'max-width:300px;white-space:normal;line-height:1.35;padding:10px', formatter: (p: { name: string }) => tip(p.name) },
      visualMap: { show: false, pieces: [{ value: 3, color: '#c9634d' }, { value: 2, color: '#dfbb72' }, { value: 1, color: '#86c8c0' }] },
      series: [{ type: 'map', map: 'region-bogota-cundinamarca', nameProperty: 'name', roam: true, scaleLimit: { min: .8, max: 8 }, label: { show: false }, emphasis: { label: { show: true, color: '#f3f0e7', fontSize: 9 }, itemStyle: { areaColor: '#b8dfd9' } }, itemStyle: { areaColor: '#1a292d', borderColor: '#405357', borderWidth: .55 }, data: [] }],
    })
    update()
    state.value = ''
  } catch {
    ready = false
    state.value = 'No fue posible cargar la base territorial local.'
  }
}
watch(show, update, { deep: true })
onMounted(() => { if (!el.value) return; observer = new ResizeObserver(() => { render(); chart?.resize() }); observer.observe(el.value); requestAnimationFrame(render) })
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose() })
</script>
<template><section class="territory-map"><div class="territory-map__header">Dependencia hídrica regional · evidencia municipal documentada · norte ←</div><div ref="el" class="territory-map__canvas" role="img" aria-label="Mapa horizontal de Bogotá y Cundinamarca, rotado con el norte hacia la izquierda."/><p v-if="state" class="territory-map__state">{{ state }}</p><div class="map-controls"><label><input v-model="show.affectation" type="checkbox"> afectación</label><label><input v-model="show.alerts" type="checkbox"> alertas</label><label><input v-model="show.projects" type="checkbox"> exploración</label></div></section></template>
<style scoped>.territory-map{position:relative;height:355px;background:#111c20;border:1px solid #2c3b3d;overflow:hidden}.territory-map__header{position:absolute;z-index:1;top:10px;left:12px;color:#afbfba;font:500 8px 'IBM Plex Mono',monospace;letter-spacing:.04em}.territory-map__canvas{height:100%;width:100%}.territory-map__state{position:absolute;z-index:3;inset:0;display:grid;place-items:center;background:#111c20e8;color:#879a95;font:500 10px 'IBM Plex Mono',monospace}.territory-map__state:before{content:'';width:15px;height:15px;border:2px solid #405357;border-top-color:#86c8c0;border-radius:50%;animation:spin .75s linear infinite;margin-bottom:-37px}@keyframes spin{to{transform:rotate(360deg)}}.map-controls{position:absolute;z-index:2;bottom:8px;left:10px;display:flex;gap:5px;flex-wrap:wrap}.map-controls label{background:#0c1417df;border:1px solid #405357;color:#afbfba;padding:3px 5px;font:8px 'IBM Plex Mono',monospace}.map-controls input{accent-color:#86c8c0;margin:0 3px 0 0;vertical-align:middle}</style>
