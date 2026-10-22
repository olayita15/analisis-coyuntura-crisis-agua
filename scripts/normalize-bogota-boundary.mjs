import { readFile, writeFile } from 'node:fs/promises'

const [input, output] = process.argv.slice(2)

if (!input || !output) {
  throw new Error('Uso: node scripts/normalize-bogota-boundary.mjs <entrada-esri.json> <salida.geojson>')
}

const source = JSON.parse(await readFile(input, 'utf8'))

if (source.geometryType !== 'esriGeometryPolygon' || !Array.isArray(source.features)) {
  throw new Error('La entrada debe ser un FeatureSet de polígonos de ArcGIS.')
}

const featureCollection = {
  type: 'FeatureCollection',
  features: source.features.map(({ attributes, geometry }) => {
    const rings = geometry?.rings
    if (!Array.isArray(rings) || rings.length !== 1) {
      throw new Error('La geometría requiere una normalización de anillos más específica.')
    }

    return {
      type: 'Feature',
      properties: attributes ?? {},
      geometry: { type: 'Polygon', coordinates: rings },
    }
  }),
}

await writeFile(output, `${JSON.stringify(featureCollection)}\n`)
