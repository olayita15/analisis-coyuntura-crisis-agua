<script setup lang="ts">
defineProps<{ kind: 'production' | 'nature' | 'law' | 'idea' | 'action'; label?: string; items?: string[] }>()

const content = {
  production: {
    label: 'Medios de producción',
    detail: 'Plantas de tratamiento, redes de acueducto y alcantarillado, embalses, pozos, canales, estaciones de bombeo, infraestructura de captación y el conocimiento técnico que permite operarlos.',
  },
  nature: {
    label: 'Bienes naturales',
    detail: 'Páramos, cerros, humedales, ríos, quebradas, cuerpos de agua, acuíferos, rondas y suelos de recarga que sostienen el ciclo hídrico.',
  },
  law: {
    label: 'Marco legal',
    detail: 'Las normas distribuyen competencias, definen deberes de protección y regulan los servicios públicos. Su existencia no garantiza por sí misma su cumplimiento.',
  },
  idea: {
    label: 'Narrativa y sentido común',
    detail: 'Las ideas sobre naturaleza, ciudad, progreso y escasez orientan qué se considera urgente, posible o aceptable en la planificación urbana.',
  },
  action: {
    label: 'Disputa colectiva',
    detail: 'La organización, la formación, la comunicación y la movilización permiten convertir el análisis en capacidad de decisión e incidencia.',
  },
}
</script>

<template>
  <span class="concept-tooltip" tabindex="0">
    <span class="concept-tooltip__trigger" :aria-label="label || content[kind].label">
      <svg v-if="kind === 'production'" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21V10l6 3V8l6 3V5l6 3v13H3Zm3-3h2v-3H6v3Zm5 0h2v-3h-2v3Zm5 0h2v-3h-2v3ZM5 8.7l4-2v3.6l-4-2Zm6-2.3l4-2v3.6l-4-2Zm6-2.3l4-2v3.6l-4-2Z"/></svg>
      <svg v-else-if="kind === 'nature'" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 3.3C14 3.4 9.7 5.4 7.4 8.1 5.1 10.8 4.8 14.2 5 18.8l1.9-.1c.1-2.1.4-3.8 1-5.2 1.6-.1 3.2-.7 4.6-1.8-1.2.2-2.4.1-3.5-.2 2.1-3.4 5.9-5.5 10.2-6.2-.8 3.3-2.5 6.3-5.2 8.1-1.4.9-3 1.4-4.7 1.5l-.3 1.9c2.2 0 4.3-.6 6.1-1.8 3.9-2.6 5.5-7.4 5.6-11.7Z"/></svg>
      <svg v-else-if="kind === 'law'" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l4 4v16H6V2Zm8 1.8V7h3.2L14 3.8ZM9 11h7v1.5H9V11Zm0 3.5h7V16H9v-1.5Zm0 3.5h5v1.5H9V18Z"/></svg>
      <svg v-else-if="kind === 'idea'" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-4.2 12.6V18h8.4v-3.4A7 7 0 0 0 12 2Zm-2.2 14.7v-3l-.8-.5A5 5 0 1 1 15 13.2l-.8.5v3H9.8ZM9 20h6v2H9v-2Z"/></svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m21 7-9 10-5-5 1.4-1.4 3.5 3.5L19.5 5 21 7ZM3 4h12v2H3V4Zm0 14h12v2H3v-2Z"/></svg>
    </span>
    <span class="concept-tooltip__content" :class="{ 'concept-tooltip__content--list': items?.length }" role="tooltip"><b>{{ label || content[kind].label }}</b><template v-if="items?.length"><ul><li v-for="item in items" :key="item">{{ item }}</li></ul></template><template v-else>{{ content[kind].detail }}</template></span>
  </span>
</template>

<style scoped>
.concept-tooltip{position:relative;display:inline-flex;vertical-align:middle;outline:none}
.concept-tooltip__trigger{display:grid;place-items:center;width:20px;height:20px;color:#86c8c0;border:1px solid #526665;border-radius:50%;cursor:help}
.concept-tooltip__trigger svg{width:12px;height:12px;fill:currentColor}
.concept-tooltip__content{pointer-events:none;opacity:0;position:absolute;z-index:60;left:0;bottom:calc(100% + 7px);width:244px;padding:9px 10px;background:#0c1417;border:1px solid #526665;color:#afbfba;font-size:.61rem;line-height:1.35;box-shadow:0 12px 28px #0008;transition:opacity .15s}
.concept-tooltip__content b{display:block;color:#dfbb72;margin-bottom:4px}
.concept-tooltip__content ul{margin:0;padding:0;list-style:none}.concept-tooltip__content li{margin:0 0 4px}.concept-tooltip__content li:last-child{margin-bottom:0}.concept-tooltip__content--list{top:calc(100% + 7px);bottom:auto;width:410px;padding:7px 9px 8px;background:linear-gradient(145deg,#14242a,#0c1417);border-color:#597b78;font-size:.43rem;line-height:1.2}.concept-tooltip__content--list b{display:flex;align-items:center;gap:5px;margin-bottom:5px;color:#f0ca7a;font:500 .51rem 'IBM Plex Mono',monospace;letter-spacing:.07em;text-transform:uppercase}.concept-tooltip__content--list b:before{content:'⚖';display:grid;place-items:center;width:15px;height:15px;border:1px solid #86c8c0;border-radius:50%;color:#86c8c0;font-size:.53rem}.concept-tooltip__content--list ul{columns:3;column-gap:10px;padding-top:5px;border-top:1px solid #355054}.concept-tooltip__content--list li{position:relative;break-inside:avoid;margin:0 0 3px;padding-left:8px;color:#c6d3ce}.concept-tooltip__content--list li:before{content:'◆';position:absolute;left:0;top:.15em;color:#86c8c0;font-size:.35rem}
.concept-tooltip:hover .concept-tooltip__content,.concept-tooltip:focus-within .concept-tooltip__content{opacity:1}
</style>
