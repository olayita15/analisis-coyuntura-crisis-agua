<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
const images: Record<string, string> = {
  'ciclo hídrico + ciudad + trabajo': '/images/01-fractura-metabolica/fractura-metabolica.jpeg',
  'planta de tratamiento': '/images/05-plantas-de-tratamiento/plantas-de-tratamiento.jpg',
  'represa o embalse': '/images/10-represas-y-embalses/represas-y-embalses.jpeg',
  'páramo': '/images/10-paramos/paramos.jpg',
  'cerros orientales / serranía': '/images/11-cerros/cerros-orientales.jpg',
  'río / quebrada urbana': '/images/12-cuerpos-de-agua/cuerpos-de-agua.jpeg',
  'humedal': '/images/13-humedales/humedales.jpg',
}
let observer: MutationObserver | undefined
let queued = false
function mountImages() {
  queued = false
  document.querySelectorAll<HTMLElement>('.image-placeholder').forEach((node) => {
    const key = node.dataset.imageKey ?? node.innerText.replace(/^IMAGEN A REEMPLAZAR\s*/i, '').trim().toLowerCase()
    if (!images[key] || node.dataset.imageMounted) return
    node.dataset.imageKey = key
    node.dataset.imageMounted = 'true'
    node.innerHTML = `<img src="${images[key]}" alt="Imagen pendiente: ${key}" />`
  })
}
function schedule() { if (!queued) { queued = true; requestAnimationFrame(mountImages) } }
onMounted(() => { schedule(); observer = new MutationObserver(schedule); observer.observe(document.body, { childList: true, subtree: true }) })
onBeforeUnmount(() => observer?.disconnect())
</script>
<template />
