<script setup lang="ts">
import type { EChartsOption } from 'echarts'
const props = defineProps<{ option: EChartsOption; ariaLabel: string }>()
const host = ref<HTMLDivElement | null>(null)
let chart: import('echarts').ECharts | undefined
let observer: ResizeObserver | undefined
onMounted(async () => {
  if (!host.value) return
  const echarts = await import('echarts')
  chart = echarts.init(host.value, undefined, { renderer: 'canvas' })
  chart.setOption(props.option, { notMerge: true })
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(host.value)
})
watch(() => props.option, option => chart?.setOption(option, { notMerge: true }), { deep: true })
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose() })
</script>
<template><div ref="host" class="e-chart" role="img" :aria-label="ariaLabel" /></template>
<style scoped>.e-chart{width:100%;min-height:340px}</style>
