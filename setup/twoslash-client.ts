import type { App } from 'vue'

// Esta presentación no contiene bloques de código Twoslash. Slidev lo instala por
// defecto y su parche interno de FloatingVue falla con la combinación actual de Vue.
// Un adaptador vacío elimina esa integración no utilizada sin afectar ECharts ni Slidev.
export default { install: (_app: App) => {} }
