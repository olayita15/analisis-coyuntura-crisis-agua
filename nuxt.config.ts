export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  css: ['~/assets/css/tokens.css'],
  app: {
    head: {
      title: 'Agua para la vida | Bogotá',
      meta: [{ name: 'description', content: 'Informe de análisis de coyuntura sobre la crisis del agua en Bogotá.' }]
    }
  }
})
