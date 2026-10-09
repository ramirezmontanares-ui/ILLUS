# ILLUS
Editor vectorial web sin dependencias externas.

## Iniciar
Desde `/workspace/ILLUS` ejecuta:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Abre la aplicación mediante el acceso web que proporcione tu entorno. Los proyectos se guardan en el almacenamiento local del navegador; no se sincronizan entre dispositivos. Exporta SVG para conservar una copia independiente.

Permite crear y eliminar proyectos, cambiar el tamaño de mesa en píxeles o centímetros, dibujar rectángulos, elipses, líneas y trazos libres, añadir texto, mover y eliminar elementos y exportar SVG. La conversión usa 96 píxeles por pulgada.

## Imágenes, capas y recortes

- Importa imágenes PNG, JPEG o WebP con **Añadir imagen**. Se conservan dentro del proyecto y del SVG exportado.
- Bloquea la imagen desde **Capas** para dibujar encima sin moverla ni eliminarla por accidente. El mismo botón permite desbloquearla.
- Usa **Vector por puntos** para marcar el contorno; pulsa **Cerrar vector** después de colocar al menos tres vértices. **Cancelar vector** descarta el contorno sin terminar. Este flujo es de vectorización manual.
- Selecciona una forma cerrada y desbloqueada y pulsa **Imagen dentro del vector**. La imagen se ajusta para cubrir la forma y se recorta con un `clipPath` de SVG. También funciona con rectángulos y elipses.
- Selecciona capas para moverlas, cambiar su opacidad o subirlas y bajarlas en el orden de dibujo.
- **PNG** exporta la mesa completa con fondo transparente a su tamaño en píxeles. Para mesas en centímetros usa la conversión de 96 ppp. Las exportaciones PNG están limitadas a 32 millones de píxeles y 16384 píxeles por lado; para tamaños mayores usa SVG.

El almacenamiento del navegador tiene un límite: importar imágenes grandes puede llenarlo. La aplicación avisa cuando no logra guardar; conserva una copia con la exportación SVG.

## Verificación funcional

Con el servidor iniciado y Playwright disponible, ejecuta `node tests/editor.cjs`. La prueba usa `/usr/bin/chromium`; puedes cambiarlo con `CHROMIUM_PATH` y cambiar la dirección del servidor con `ILLUS_URL`. Comprueba imágenes, bloqueos, vectores cerrados, recortes, persistencia y exportaciones SVG/PNG.
