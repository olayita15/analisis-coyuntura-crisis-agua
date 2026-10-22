<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
const el = ref<HTMLDivElement>(); let chart: echarts.ECharts | undefined; let observer: ResizeObserver | undefined
function render() { if (!el.value || chart || !el.value.clientWidth || !el.value.clientHeight) return; chart = echarts.init(el.value); chart.setOption({ textStyle:{color:'#afbfba'}, animationDuration:900, tooltip:{trigger:'item'}, legend:{bottom:0,textStyle:{color:'#afbfba'}}, series:[{type:'pie',radius:['48%','72%'],label:{color:'#f3f0e7',formatter:'{b}\n{c}'},data:[{value:222,name:'Ilegales',itemStyle:{color:'#d76b4f'}},{value:231,name:'En trámite',itemStyle:{color:'#dfbb72'}},{value:68,name:'Sin detalle en la síntesis',itemStyle:{color:'#86c8c0'}}]}] }) }
onMounted(() => { if (!el.value) return; observer = new ResizeObserver(() => { render(); chart?.resize() }); observer.observe(el.value); requestAnimationFrame(render) }); onBeforeUnmount(()=>{ observer?.disconnect(); chart?.dispose() })
</script>
<template><div ref="el" style="height:190px;width:100%" role="img" aria-label="Estado de 521 pozos subterráneos registrados en 2020" /></template>
