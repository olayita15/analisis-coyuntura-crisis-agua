import type { EChartsOption } from 'echarts'
export const pressureSummary = 'Hallazgos seleccionados de derechos de petición sobre agua y ordenamiento en Bogotá.'
export const pressureOption: EChartsOption = {
  animationDuration: 850, backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, grid: { left: 155, right: 35, top: 15, bottom: 35 },
  xAxis: { type: 'value', axisLabel:{ color:'#e9f5f1' }, splitLine:{lineStyle:{color:'rgba(184,236,233,.16)'}} },
  yAxis: { type:'category', data:['Planes parciales en rondas\n(2015–2025)', 'Proyectos con afectación\ndirecta (2020–2025)', 'Concesiones subterráneas\nreportadas'], axisLabel:{color:'#e9f5f1', lineHeight:16}, axisLine:{show:false}, axisTick:{show:false} },
  series:[{ type:'bar', data:[21,11,61], barWidth:30, itemStyle:{color:'#9ac65c',borderRadius:[0,6,6,0]}, label:{show:true,position:'right',color:'#f7f5ee',fontWeight:'bold'} }]
}
