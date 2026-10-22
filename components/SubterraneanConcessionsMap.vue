<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
// Componente de mapa de concesiones: mantener este archivo como módulo Vue independiente para HMR de Slidev.

const mapUrl = (file: string) => `${import.meta.env.BASE_URL}data/maps/${file}`

type Point = { properties: Record<string, string>; geometry: { coordinates: [number, number] } }
type Match = { status: 'exacta' | 'operador'; concession: string; volume: string; note: string }
type MarkerMeta = Match & { code: string; locality: string; state: string; variant?: string; distinct?: boolean }
// Iconify / EmojiOne Monotone: emojione-monotone:potable-water.
const waterWellSymbol = 'path://M17.498 43.027h8.373l.44-4.058h-9.252zM32 2C15.432 2 2 15.432 2 32s13.432 30 30 30s30-13.432 30-30S48.568 2 32 2m-7.473 10.93c.166 0 1.463.021 1.617.064c.633.047 1.311.105 4.436.123A2.75 2.75 0 0 1 32.788 12c.9 0 1.699.438 2.205 1.117c3.125-.018 3.803-.076 4.436-.123c.154-.043 1.453-.064 1.619-.064c1.023 0 1.854.846 1.854 1.889s-.83 1.889-1.854 1.889c-.166 0-1.465-.023-1.619-.064c-.633-.049-1.311-.105-4.436-.123a2.8 2.8 0 0 1-.463.488v2.289h1.023c.564 0 1.021.467 1.021 1.043s-.457 1.043-1.021 1.043H30.02c-.564 0-1.021-.467-1.021-1.043s.457-1.043 1.021-1.043h1.025v-2.289a3 3 0 0 1-.465-.488c-3.125.018-3.803.074-4.436.123c-.154.041-1.451.064-1.617.064c-1.025 0-1.855-.846-1.855-1.889s.83-1.889 1.855-1.889M25.852 52h-8.336L16 38.004h11.367zm17.621-21.023h-4.815c-.23 0-.492.221-.605.416c-1.029 1.883-3.002 3.156-5.265 3.156c-2.256 0-4.221-1.264-5.254-3.133c-.107-.201-.379-.439-.619-.439h-.635c-.969 0-1.752.799-1.752 1.785v1.787h-5.686v-5.098c0-2.355 1.875-4.266 4.188-4.266h4.945c.564 0 1.023-.467 1.023-1.043V23.1h7.576v1.043c0 .576.459 1.043 1.025 1.043h5.873zM48 32.791h-2.842V23.1H48z'
const match = (status: Match['status'], concession: string, volume: string, note: string): Match => ({ status, concession, volume, note })
const selected = new Map<string, Match>([
  ['pz-19-0027', match('exacta', 'Frigorífico Guadalupe No. 3', '1.296 m³/día', 'El nombre del predio coincide directamente con la concesión de la tabla.')],
  ['pz-08-0023', match('operador', 'Textiles Lafayette', '1.441 m³/día', 'Coincidencia por operador; la capa nombra el predio, no “Lafayette No. 1”.')],
  ['pz-08-0012', match('operador', 'Gaseosas Colombianas · Planta Sur', '1.095,5 m³/día', 'Coincidencia por operador; no asigna este punto a No. 2 o No. 3.')],
  ['pz-08-0013', match('operador', 'Gaseosas Colombianas · Planta Sur', '1.095,5 m³/día', 'Coincidencia por operador; no asigna este punto a No. 2 o No. 3.')],
  ['pz-09-0043', match('operador', 'Manufacturas Eliot / Pat Primo', '864 m³/día', 'Coincidencia por operador; el número de captación no coincide explícitamente.')],
  ['pz-09-0044', match('operador', 'Manufacturas Eliot / Pat Primo', '864 m³/día', 'Coincidencia por operador; el número de captación no coincide explícitamente.')],
  ['pz-16-0040', match('operador', 'Textilia S.A.S.', '798,5 m³/día', 'Coincidencia por operador; la capa no identifica “Textilia No. 1”.')],
  ['pz-16-0041', match('operador', 'Textilia S.A.S.', '798,5 m³/día', 'Coincidencia por operador; la capa no identifica “Textilia No. 1”.')],
  ['pz-16-0017', match('operador', 'Tintorería Asitex', '750 m³/día', 'Coincidencia por operador; la capa no identifica el No. 2.')],
  ['pz-16-0034', match('operador', 'Tintorería Asitex', '750 m³/día', 'Coincidencia por operador; la capa no identifica el No. 2.')],
  ['pz-16-0003', match('operador', 'Gaseosas Lux', '581,25 m³/día', 'Coincidencia por operador; el punto rotulado es Lux No. 1, no No. 2.')],
  ['pz-16-0004', match('operador', 'Gaseosas Lux', '581,25 m³/día', 'Coincidencia por operador; la capa no identifica el No. 2.')],
])
const focusCodes = new Set(['08', '09', '16'])
// Encuadre elegido para Kennedy, Fontibón y Puente Aranda.
const initialCenter: [number, number] = [-74.5726, 4.3563]
const initialZoom = 4.97
const el = ref<HTMLDivElement>()
let chart: echarts.ECharts | undefined
let observer: ResizeObserver | undefined

async function render() {
  if (!el.value || chart || !el.value.clientWidth) return
  const [boundary, points, localities] = await Promise.all([
    fetch(mapUrl('bogota-distrito.geojson')).then(r => r.json()),
    fetch(mapUrl('bogota-puntos-agua-subterranea.geojson')).then(r => r.json()),
    fetch(mapUrl('bogota-localidades.geojson')).then(r => r.json()),
  ])
  if (!el.value || chart) return
  const ring = boundary.features[0].geometry.coordinates[0] as [number, number][]
  const xs = ring.map(p => p[0]), ys = ring.map(p => p[1])
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const rotatePoint = ([x, y]: [number, number]): [number, number] => [cx - (y - cy), cy + (x - cx)]
  const rotate = (v: unknown): unknown => Array.isArray(v) && typeof v[0] === 'number' ? rotatePoint(v as [number, number]) : (v as unknown[]).map(rotate)
  const coordinatesOf = (value: unknown, output: [number, number][] = []): [number, number][] => {
    if (Array.isArray(value) && typeof value[0] === 'number') output.push(value as [number, number])
    else if (Array.isArray(value)) value.forEach(item => coordinatesOf(item, output))
    return output
  }
  localities.features.forEach((f: { properties: Record<string, string>; geometry: { coordinates: unknown } }) => { f.properties.name = f.properties.LocNombre; f.geometry.coordinates = rotate(f.geometry.coordinates) })
  const names = Object.fromEntries(localities.features.map((f: { properties: Record<string, string> }) => [f.properties.LocCodigo, f.properties.LocNombre])) as Record<string, string>
  const markers: { name: string; value: [number, number]; meta: MarkerMeta; symbol: string; label?: { show: boolean; formatter: string; position: 'right'; color: string; fontSize: number; fontWeight: number; backgroundColor: string; padding: number[] } }[] = (points.features as Point[]).filter(p => selected.has(p.properties['Código'])).map(p => ({ name: p.properties.Nombre_Predio, value: rotatePoint(p.geometry.coordinates), symbol: waterWellSymbol, meta: { ...selected.get(p.properties['Código'])!, code: p.properties['Código'], locality: p.properties.Localidad, state: p.properties.Estado } }))
  const groupSizes = markers.reduce((out: Record<string, number>, marker) => { out[marker.meta.concession] = (out[marker.meta.concession] || 0) + 1; return out }, {})
  const groupIndex: Record<string, number> = {}
  markers.forEach(marker => { const group = marker.meta.concession; groupIndex[group] = (groupIndex[group] || 0) + 1; if (groupSizes[group] > 1) { marker.meta.distinct = true; marker.meta.variant = `${groupIndex[group]} de ${groupSizes[group]}`; marker.label = { show: true, formatter: String(groupIndex[group]), position: 'right', color: '#f3f0e7', fontSize: 9, fontWeight: 700, backgroundColor: '#0c1417cc', padding: [1, 3] } } })
  const localMarkers = markers.filter(m => focusCodes.has(m.meta.locality))
  const counts = localMarkers.reduce((out: Record<string, number>, m) => { const n = names[m.meta.locality]; if (n) out[n] = (out[n] || 0) + 1; return out }, {})
  const documentedLocalities = new Set(markers.map(marker => names[marker.meta.locality]))
  const unknownLocalities = localities.features
    .filter((feature: { properties: Record<string, string> }) => !documentedLocalities.has(feature.properties.LocNombre))
    .map((feature: { properties: Record<string, string>; geometry: { coordinates: unknown } }) => {
      const positions = coordinatesOf(feature.geometry.coordinates)
      const center = positions.reduce((sum, point) => [sum[0] + point[0], sum[1] + point[1]], [0, 0]).map(value => value / positions.length)
      return { name: feature.properties.LocNombre, value: center }
    })
  echarts.registerMap('bogota-concesiones-localidades', localities)
  chart = echarts.init(el.value)
  chart.setOption({
    animationDuration: 650,
    legend: { show: true, selectedMode: true, icon: waterWellSymbol, right: 8, bottom: 7, orient: 'vertical', itemWidth: 13, itemHeight: 13, itemGap: 5, textStyle: { color: '#d7e2dc', fontSize: 8 }, backgroundColor: '#0c1417df', borderColor: '#405357', borderWidth: 1, padding: [5, 6] },
    tooltip: { trigger: 'item', confine: true, backgroundColor: '#0c1417', borderColor: '#526665', textStyle: { color: '#f3f0e7', fontSize: 10 }, extraCssText: 'max-width:275px;white-space:normal;line-height:1.32;padding:9px',
      formatter: (p: { data?: { meta?: MarkerMeta } }) => { const m = p.data?.meta; if (!m) return ''; const color = m.status === 'exacta' ? '#c9634d' : '#dfbb72'; const distinct = m.distinct ? `<br/><b>Registro SDA:</b> punto ${m.variant}; código y coordenada propios.` : ''; return `<b>${m.concession}</b><br/><span style="color:${color}">${m.status === 'exacta' ? 'Coincidencia exacta' : 'Coincidencia por operador'}</span><br/><br/><b>Volumen de concesión:</b> ${m.volume}<br/><b>Punto SDA:</b> ${m.code} · localidad ${m.locality}${distinct}<br/><b>Estado SDA:</b> código ${m.state}<br/><br/><span style="color:#afbfba">${m.note}</span><br/><br/><span style="color:#86c8c0">Fuentes: EAAB (concesiones, 2025); SDA (puntos de captación, act. 31 mar. 2026).</span>` } },
    geo: { map: 'bogota-concesiones-localidades', roam: false, center: initialCenter, zoom: initialZoom, label: { show: true, fontSize: 7, color: '#e5eee9', formatter: (p: { name: string }) => counts[p.name] >= 2 ? `${p.name}\n${counts[p.name]} puntos` : '' }, itemStyle: { areaColor: '#17282d', borderColor: '#4a6264', borderWidth: .8 }, regions: Object.entries(counts).map(([name, count]) => ({ name, itemStyle: { areaColor: count >= 5 ? '#763e36' : count >= 3 ? '#6a5740' : '#31474a' } })), emphasis: { itemStyle: { areaColor: '#223a3e' } } },
    series: [
      { name: 'Por operador', type: 'scatter', coordinateSystem: 'geo', data: localMarkers.filter(m => m.meta.status === 'operador'), symbolSize: 18, itemStyle: { color: '#dfbb72', borderColor: '#0c1417', borderWidth: 1 }, z: 3 },
      { name: 'Exacta', type: 'scatter', coordinateSystem: 'geo', data: markers.filter(m => m.meta.status === 'exacta'), symbolSize: 22, itemStyle: { color: '#c9634d', borderColor: '#f3f0e7', borderWidth: 1.5 }, z: 5 },
      { name: 'Sin coincidencia documentada', type: 'scatter', coordinateSystem: 'geo', data: unknownLocalities, symbolSize: 1, itemStyle: { color: 'transparent' }, label: { show: true, formatter: '?', color: '#aab8b4', fontSize: 15, fontWeight: 700, textBorderColor: '#111c20', textBorderWidth: 3 }, tooltip: { formatter: (p: { name: string }) => `<b>${p.name}</b><br/><span style="color:#afbfba">Sin coincidencia en la selección de concesiones analizada; no equivale a ausencia de pozos.</span>` }, z: 2 },
    ],
  })
  chart.setOption({ geo: { roam: true, scaleLimit: { min: 2.3, max: 20 } } })
}
onMounted(() => { if (!el.value) return; observer = new ResizeObserver(() => { render(); chart?.resize() }); observer.observe(el.value); requestAnimationFrame(render) })
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose() })
</script>
<template>
  <section class="concessions-map">
    <div class="concessions-map__title">Kennedy · Fontibón · Puente Aranda · norte ←</div>
    <div ref="el" class="concessions-map__canvas" role="img" aria-label="Mapa navegable concentrado en Kennedy, Fontibón y Puente Aranda, con captaciones subterráneas vinculadas a concesiones de mayor volumen."/>
  </section>
</template>
<style scoped>
.concessions-map{position:relative;height:240px;background:#111c20;border:1px solid #2c3b3d;overflow:hidden}.concessions-map__title{position:absolute;z-index:1;top:9px;left:11px;color:#afbfba;font:500 8px 'IBM Plex Mono',monospace;letter-spacing:.035em;pointer-events:none}.concessions-map__canvas{height:100%;width:100%}
</style>
