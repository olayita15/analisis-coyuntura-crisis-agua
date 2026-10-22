<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
const el = ref<HTMLDivElement>(); let chart: echarts.ECharts | undefined; let observer: ResizeObserver | undefined
function render() { if (!el.value || chart || !el.value.clientWidth || !el.value.clientHeight) return; chart = echarts.init(el.value); chart.setOption({ textStyle:{color:'#afbfba'}, animationDuration:900, grid:{left:110,right:40,top:20,bottom:35}, xAxis:{type:'value',name:'Millones COP',axisLabel:{color:'#afbfba'},splitLine:{lineStyle:{color:'#2c3b3d'}}}, yAxis:{type:'category',data:['Hallazgos fiscales\n2020–2022','Contrato Wiesner\n2022'],axisLabel:{lineHeight:15,color:'#afbfba'}}, tooltip:{trigger:'axis'},series:[{type:'bar',data:[60696,141373],barWidth:32,itemStyle:{color:'#86c8c0',borderRadius:[0,5,5,0]},label:{show:true,position:'right',color:'#f3f0e7',formatter:'${c} M'}}] }) }
onMounted(() => { if (!el.value) return; observer = new ResizeObserver(() => { render(); chart?.resize() }); observer.observe(el.value); requestAnimationFrame(render) }); onBeforeUnmount(()=>{ observer?.disconnect(); chart?.dispose() })
</script>
<template><div ref="el" style="height:180px;width:100%" role="img" aria-label="Hallazgos fiscales y monto de contrato de expansión de planta Wiesner" /></template>
