<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
const el = ref<HTMLDivElement>(); let chart: echarts.ECharts | undefined; let observer: ResizeObserver | undefined
function render() { if (!el.value || chart || !el.value.clientWidth || !el.value.clientHeight) return; chart = echarts.init(el.value); chart.setOption({ textStyle:{color:'#afbfba'}, animationDuration:900, grid:{left:142,right:32,top:18,bottom:30}, xAxis:{type:'value',axisLabel:{color:'#afbfba'},splitLine:{lineStyle:{color:'#2c3b3d'}}}, yAxis:{type:'category',data:['Planes parciales en rondas\n2015–2025','Proyectos con afectación\ndirecta 2020–2025'],axisLabel:{lineHeight:15,color:'#afbfba'}}, tooltip:{trigger:'axis'},series:[{type:'bar',data:[21,11],barWidth:34,itemStyle:{color:'#9daf72',borderRadius:[0,5,5,0]},label:{show:true,position:'right',color:'#f3f0e7'}}] }) }
onMounted(() => { if (!el.value) return; observer = new ResizeObserver(() => { render(); chart?.resize() }); observer.observe(el.value); requestAnimationFrame(render) }); onBeforeUnmount(()=>{ observer?.disconnect(); chart?.dispose() })
</script>
<template><div ref="el" style="height:245px;width:100%" role="img" aria-label="Planes parciales en rondas y proyectos con afectación a cuerpos de agua" /></template>
