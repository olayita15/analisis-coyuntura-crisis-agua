<script setup lang="ts">defineProps<{ title:string }>()</script>
<template><details><summary>Ver ficha de evidencia</summary><div class="dialog"><h3>{{ title }}</h3><slot /></div></details></template>
<style scoped>summary{cursor:pointer;color:#007c84;font-weight:600;font-size:.76rem;margin-top:9px}.dialog{position:absolute;z-index:10;max-width:520px;background:#fff;border:1px solid #dce4e2;box-shadow:0 16px 40px #17202630;padding:15px;border-radius:6px;font-size:.7rem}.dialog :deep(p){font-size:.7rem;margin:.35rem 0}</style>
