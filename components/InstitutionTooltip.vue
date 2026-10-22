<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ name:string; responsibility:string; fullName?:string }>()
const acronyms: Record<string, string> = {
  EAAB: 'Empresa de Acueducto y Alcantarillado de Bogotá',
  CRA: 'Comisión de Regulación de Agua Potable y Saneamiento Básico',
  SDA: 'Secretaría Distrital de Ambiente',
  SDP: 'Secretaría Distrital de Planeación',
  CAR: 'Corporación Autónoma Regional de Cundinamarca',
  SSPD: 'Superintendencia de Servicios Públicos Domiciliarios',
  MADS: 'Ministerio de Ambiente y Desarrollo Sostenible',
  IDIGER: 'Instituto Distrital de Gestión de Riesgos y Cambio Climático',
  JBB: 'Jardín Botánico de Bogotá José Celestino Mutis',
  SINA: 'Sistema Nacional Ambiental',
}
const expandedName = computed(() => props.fullName || acronyms[props.name] || props.name)
</script>
<template><span class="tooltip"><span class="trigger" tabindex="0" :title="`${expandedName}: ${responsibility}`">{{ name }} <i>i</i></span><span class="content" role="tooltip"><b v-if="expandedName !== name">{{ expandedName }} ({{ name }})</b><b v-else>{{ name }}</b>{{ responsibility }}</span></span></template>
<style scoped>.tooltip{position:relative;display:inline-block}.trigger{display:inline-flex;align-items:center;gap:4px;color:#f3f0e7;cursor:help;outline:none}.trigger:focus{outline:1px solid #dfbb72;outline-offset:3px}.trigger i{display:inline-grid;place-items:center;width:13px;height:13px;border:1px solid #86c8c0;border-radius:50%;font:500 8px Georgia;color:#86c8c0}.content{pointer-events:none;opacity:0;position:absolute;z-index:50;left:0;bottom:calc(100% + 8px);width:220px;padding:10px 11px;background:#0c1417;border:1px solid #526665;color:#afbfba;font-size:.64rem;line-height:1.35;box-shadow:0 12px 28px #0008;transition:opacity .15s}.content b{display:block;color:#dfbb72;margin-bottom:4px}.tooltip:hover .content,.tooltip:focus-within .content{opacity:1}</style>
