# Límites territoriales para los mapas

Estos archivos están listos para cargarse con ECharts (`geoJSON`) o con bibliotecas cartográficas compatibles con GeoJSON.

| Archivo | Cobertura | Fuente y transformación |
| --- | --- | --- |
| `bogota-distrito.geojson` | Límite del Distrito Capital de Bogotá | GeoJSON normalizado desde el recurso `muni.json` de Datos Abiertos Bogotá. La fuente original se conserva como `bogota-distrito.esri.json` porque, aunque su URL termina en `.json`, usa el formato ArcGIS FeatureSet. |
| `cundinamarca-municipios.geojson` | 117 municipios de Cundinamarca | Consulta de la capa oficial **municipios** del IGAC, filtrada por `Depto = 'Cundinamarca'`, con salida GeoJSON y coordenadas EPSG:4326. |
| `bogota-localidades.geojson` | 20 localidades de Bogotá | GeoJSON normalizado desde el recurso `loca.json` de Datos Abiertos Bogotá. La fuente original ArcGIS se conserva como `bogota-localidades.esri.json`. |

## Uso sugerido en ECharts

```ts
const geojson = await fetch('/data/maps/cundinamarca-municipios.geojson').then((response) => response.json())
echarts.registerMap('cundinamarca', geojson)
```

Los nombres y códigos DANE de la capa del IGAC se encuentran en `properties.MpNombre` y `properties.MpCodigo`.
