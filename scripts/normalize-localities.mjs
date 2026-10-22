import { readFile, writeFile } from 'node:fs/promises'

const source = JSON.parse(await readFile('public/data/maps/bogota-localidades.esri.json', 'utf8'))
const signedArea = (ring) => ring.reduce((sum, point, index) => {
  const next = ring[(index + 1) % ring.length]
  return sum + point[0] * next[1] - next[0] * point[1]
}, 0) / 2

const features = source.features.map(({ attributes, geometry }) => {
  const rings = geometry.rings
  const outers = rings.filter((ring) => signedArea(ring) < 0)
  const holes = rings.filter((ring) => signedArea(ring) >= 0)
  const polygons = outers.map((outer, index) => index === 0 ? [outer, ...holes] : [outer])
  return {
    type: 'Feature',
    properties: attributes,
    geometry: polygons.length === 1
      ? { type: 'Polygon', coordinates: polygons[0] }
      : { type: 'MultiPolygon', coordinates: polygons },
  }
})

await writeFile('public/data/maps/bogota-localidades.geojson', `${JSON.stringify({ type: 'FeatureCollection', features })}\n`)
