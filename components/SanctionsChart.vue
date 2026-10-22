<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
const el = ref<HTMLDivElement>(); let chart: echarts.ECharts | undefined; let observer: ResizeObserver | undefined
function render() { if (!el.value || chart || !el.value.clientWidth || !el.value.clientHeight) return; chart = echarts.init(el.value); chart.setOption({ textStyle:{color:'#afbfba'}, animationDuration:900, grid:{left:130,right:36,top:20,bottom:24}, xAxis:{type:'value',name:'Millones COP',axisLabel:{color:'#afbfba'},splitLine:{lineStyle:{color:'#2c3b3d'}}}, yAxis:{type:'category',data:['Petrobras','Escuela Colombiana\nde Ingeniería','Permoda','Gravas del Tunjuelo','Printer Colombiana'],axisLabel:{lineHeight:14,color:'#afbfba'}}, tooltip:{trigger:'axis'}, series:[{type:'bar',data:[4395.1,1800.8,1792,1605.4,1556.9],itemStyle:{color:'#9daf72',borderRadius:[0,5,5,0]},label:{show:true,position:'right',color:'#f3f0e7',formatter:'{c}'} }] }) }
onMounted(() => { if (!el.value) return; observer = new ResizeObserver(() => { render(); chart?.resize() }); observer.observe(el.value); requestAnimationFrame(render) }); onBeforeUnmount(()=>{ observer?.disconnect(); chart?.dispose() })
</script>
<template><div ref="el" style="height:280px;width:100%" role="img" aria-label="Cinco sanciones ambientales de mayor valor referenciadas en el análisis" /></template>
