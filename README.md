# Entrega-Ecommerce

Repositorio: https://github.com/MaximoRyder/Entrega-Ecommerce

Última actualización: 2025-10-23

## Descripción

Entrega-Ecommerce es una aplicación frontend de tienda online (ecommerce) creada con React y Vite. Implementa el listado de productos, la interacción con un carrito de compras y rutas de navegación (react-router-dom). El proyecto contiene estilos hechos con Tailwind y la lógica en JavaScript/React.

## Tecnologías principales

- React ^19.1.1
- React DOM ^19.1.1
- React Router DOM ^6.14.1
- Vite (dev server / build)
- JavaScript (con JSX)
- CSS para estilos

(Estas dependencias están definidas en package.json del proyecto.)

## Características

- Listado y visualización de productos.
- Añadir / quitar productos del carrito.
- Persistencia local del carrito con localStorage.
- Ruteo entre vistas con react-router-dom.
- Desarrollo con Vite.

## Requisitos

- Node.js (>= 16 recomendado)
- pnpm
- Navegador moderno

## Instalación y ejecución (desarrollo)

1. Clona el repositorio:

   ```bash
   git clone https://github.com/MaximoRyder/Entrega-Ecommerce.git
   cd Entrega-Ecommerce
   ```

2. Instala dependencias:

   ```bash
   npm install
   pnpm install
   ```

3. Ejecuta el servidor de desarrollo (Vite):
   ```bash
   pnpm run dev
   ```
   Abre la URL que muestre Vite (por defecto http://localhost:5173/Entrega-Ecommerce).

## Scripts disponibles

- pnpm run dev — Inicia Vite en modo desarrollo.

## Estructura típica del proyecto

- /src
  - /components
  - /context
  - /styles
  - main.jsx
  - App.jsx
- index.html
- package.json
- vite.config.js
- README.md

## Notas y recomendaciones

- El proyecto está configurado para React + Vite (ver package.json y @vitejs/plugin-react).
- Si hay problemas con importaciones relativas o módulos ES al abrir archivos directamente desde el sistema de ficheros, usar el servidor de desarrollo (pnpm run dev).

## Contacto

- Autor / Mantenedor: MaximoRyder
- Repo: https://github.com/MaximoRyder/Entrega-Ecommerce
