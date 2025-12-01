# Entrega-Ecommerce

Repositorio: https://github.com/MaximoRyder/Entrega-Ecommerce

Última actualización: 2025-12-01

## Descripción

Entrega-Ecommerce es una aplicación frontend de tienda online (ecommerce) creada con React y Vite. Incluye listado de productos, búsqueda y filtros, detalle de producto, gestión de carrito con persistencia en `localStorage`, autenticación básica (login / registro) y un panel administrativo para manejar productos, categorías, pedidos y usuarios. Los estilos combinan Tailwind CSS con archivos CSS locales y la lógica está implementada en JavaScript/React.

## Tecnologías principales

- React ^19.1.1
- React DOM ^19.1.1
- React Router DOM ^6.14.1
- Vite (dev server / build)
- Tailwind CSS
- JavaScript (con JSX)
- CSS para estilos (archivos en `src/styles`)

(Estas dependencias están definidas en `package.json` del proyecto.)

## Características

- Listado y visualización de productos con tarjetas y detalle individual.
- Búsqueda y filtros (componente `SearchForm` y `FilterProvider`).
- Paginación en listados (`Pagination`).
- Añadir / quitar productos del carrito y selector de cantidad (`QuantitySelector`).
- Persistencia del carrito en `localStorage` (contexto `CartContext`).
- Autenticación de usuarios (login / register) y manejo de sesión (`AuthContext`).
- Rutas protegidas y comprobación de permisos (`RequireAuth`, `RequireAdmin`).
- Panel administrativo para gestionar: productos, categorías, pedidos y usuarios (`Admin*` components).
- Modales reutilizables para confirmaciones y edición (`ConfirmModal`, `AdminEntityModal`).
- Notificaciones tipo toast (`ToastContext`).
- Validaciones de formularios y utilidades (`utils/validators.js`, `utils/format.js`).
- Diseño responsive y estilos con Tailwind y CSS local.

## Requisitos

- Node.js (>= 16 recomendado)
- pnpm (se incluyen scripts pensados para `pnpm`)
- Navegador moderno

## Instalación y ejecución (desarrollo)

1. Clona el repositorio:

   ```bash
   git clone https://github.com/MaximoRyder/Entrega-Ecommerce.git
   cd Entrega-Ecommerce
   ```

2. Instala dependencias (usa `pnpm` o `npm` si lo prefieres):

   ```bash
   pnpm install
   # o
   npm install
   ```

3. Ejecuta el servidor de desarrollo (Vite):
   ```bash
   pnpm run dev
   ```
   Abre la URL que muestre Vite (por defecto `http://localhost:5173/Entrega-Ecommerce`).

## Scripts disponibles

- `pnpm run dev` — Inicia Vite en modo desarrollo.

## Estructura del proyecto

- `src/`
  - `components/` — Componentes de UI y vistas principales:
    - `About.jsx`
    - `Admin.jsx`
    - `AdminCategories.jsx`
    - `AdminEntityModal.jsx`
    - `AdminOrders.jsx`
    - `AdminProducts.jsx`
    - `AdminUsers.jsx`
    - `CartPage.jsx`
    - `ConfirmModal.jsx`
    - `FAQ.jsx`
    - `Footer.jsx`
    - `FormField.jsx`
    - `Header.jsx`
    - `Home.jsx`
    - `Layout.jsx`
    - `Login.jsx`
    - `Pagination.jsx`
    - `ProductCard.jsx`
    - `ProductDetail.jsx`
    - `ProductsList.jsx`
    - `QuantitySelector.jsx`
    - `Register.jsx`
    - `RequireAdmin.jsx`
    - `RequireAuth.jsx`
    - `SearchForm.jsx`
  - `context/` — Providers y contextos:
    - `AuthContext.jsx`
    - `CartContext.jsx`
    - `FilterProvider.jsx`
    - `searchContext.js`
    - `ToastContext.jsx`
    - `toastContextObj.js`
  - `styles/` — Archivos CSS específicos por componente.
  - `utils/` — Utilidades y validadores.
  - `main.jsx`, `App.jsx`
- `index.html`
- `package.json`
- `vite.config.js`
- `README.md`

## Notas y recomendaciones

- El proyecto está configurado para React + Vite (ver `package.json` y `@vitejs/plugin-react`).
- Si hay problemas con importaciones relativas o módulos ES al abrir archivos directamente desde el sistema de ficheros, usar el servidor de desarrollo (`pnpm run dev`).
- Para pruebas rápidas, revisar los componentes bajo `src/components` y los contextos en `src/context`.

## Contacto

- Autor / Mantenedor: MaximoRyder
- Repo: https://github.com/MaximoRyder/Entrega-Ecommerce
