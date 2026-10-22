import { defineShortcutsSetup } from '@slidev/types'

// La presentación se navega con flechas, espacio y los controles estándar.
// Se desactiva "G" para que el diálogo de salto no se superponga al contenido.
export default defineShortcutsSetup((_nav, shortcuts) =>
  shortcuts.filter(shortcut => shortcut.name !== 'goto'),
)
