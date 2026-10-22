import type { EChartsOption } from 'echarts'

export const lossesSummary = 'Pérdidas de agua por daños en la red de Bogotá: 2020 a 2024, en millones de metros cúbicos.'
export const lossesOption: EChartsOption = {
  animationDuration: 850, animationEasing: 'cubicOut', backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', valueFormatter: value => `${value} millones de m³` },
  grid: { left: 46, right: 24, top: 36, bottom: 35 },
  xAxis: { type: 'category', data: ['2020', '2021', '2022', '2023', '2024'], axisLine: { lineStyle: { color: '#8db7b8' } }, axisLabel: { color: '#e9f5f1' } },
  yAxis: { type: 'value', name: 'Millones de m³', nameTextStyle: { color: '#b8ece9' }, axisLabel: { color: '#e9f5f1' }, splitLine: { lineStyle: { color: 'rgba(184,236,233,.16)' } } },
  series: [{ type: 'bar', data: [22.27, 24.48, 23.52, 23.26, 36.88], barMaxWidth: 55, itemStyle: { color: '#4db5c4', borderRadius: [6,6,0,0] }, label: { show: true, position: 'top', color: '#f7f5ee', formatter: '{c}' } }]
}
