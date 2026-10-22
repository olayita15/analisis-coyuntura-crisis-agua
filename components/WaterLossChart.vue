<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
const el = ref<HTMLDivElement>(); let chart: echarts.ECharts | undefined; let observer: ResizeObserver | undefined
function render() { if (!el.value || chart || !el.value.clientWidth || !el.value.clientHeight) return; chart = echarts.init(el.value); chart.setOption({ textStyle:{color:'#afbfba'}, animationDuration:1000, grid:{left:45,right:20,top:32,bottom:35}, tooltip:{trigger:'axis'}, xAxis:{type:'category',data:['2020','2021','2022','2023','2024'],axisLabel:{color:'#afbfba'},axisLine:{lineStyle:{color:'#526665'}}}, yAxis:{type:'value',name:'Millones de m³',nameTextStyle:{color:'#afbfba'},axisLabel:{color:'#afbfba'},splitLine:{lineStyle:{color:'#2c3b3d'}}}, series:[{type:'bar',data:[22.27,24.48,23.52,23.26,36.88],barMaxWidth:52,itemStyle:{color:'#86c8c0',borderRadius:[5,5,0,0]},label:{show:true,position:'top',color:'#f3f0e7'}}] }) }
onMounted(() => { if (!el.value) return; observer = new ResizeObserver(() => { render(); chart?.resize() }); observer.observe(el.value); requestAnimationFrame(render) }); onBeforeUnmount(()=>{ observer?.disconnect(); chart?.dispose() })
</script>
<template><div ref="el" style="height:135px;width:100%" aria-label="Pérdidas de agua por daños de red, Bogotá, 2020 a 2024" role="img" /></template>
