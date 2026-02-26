# react-pivottable-plus

[![NPM Version](https://img.shields.io/npm/v/react-pivottable-plus.svg)](https://www.npmjs.com/package/react-pivottable-plus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React 18+](https://img.shields.io/badge/React-%3E%3D18-blue.svg)](https://react.dev/)

**La solución definitiva de Tablas Dinámicas para el ecosistema moderno de React.**

`react-pivottable-plus` es una versión premium y mantenida de `react-pivottable`, rediseñada para ofrecer una experiencia de usuario excepcional con soporte nativo para Tailwind CSS, Radix UI y Shadcn.

## 🌐 Enlaces Rápidos

- 📚 **[Documentación Oficial](https://jasp402.github.io/react-pivottable-plus/)**
- 🚀 **[Guía de Inicio Rápido](https://jasp402.github.io/react-pivottable-plus/docs/get-started)**
- 🎨 **[Galería de Interfaces](https://jasp402.github.io/react-pivottable-plus/examples/gallery)**

## 🚀 Por qué elegir esta versión?

A diferencia de otros forks estancados, `react-pivottable-plus` ofrece:

- **Soporte React 18+**: Compatible con React 18 y React 19.
- **UI de Próxima Generación**: Renderizadores modernos integrados.
- **Paginación Inteligente**: Rendimiento fluido con grandes conjuntos de datos.
- **SSR Ready**: Compatible con Next.js App Router y Pages Router.
- **Configuración Cero**: Implementación en segundos con valores por defecto robustos.

## 📦 Instalación

```bash
npm install react-pivottable-plus
```

> **Nota:** `react` y `react-dom` versión `>=18.0.0` son peerDependencies. Deben estar ya instaladas en tu proyecto.

## 🛠️ Uso Básico (React / Vite / CRA)

```jsx
import React, { useState } from 'react';
import PivotTableUI from 'react-pivottable-plus';
import 'react-pivottable-plus/react_pivottable_plus.css';

const data = [
  { producto: "Manzana", categoria: "Fruta", ventas: 100 },
  { producto: "Pera", categoria: "Fruta", ventas: 150 },
];

function App() {
  const [state, setState] = useState({});

  return (
    <PivotTableUI
      data={data}
      onChange={s => setState(s)}
      {...state}
    />
  );
}
```

## ⚡ Uso con Next.js

Esta librería es compatible con Next.js tanto con **App Router** (React Server Components) como con **Pages Router**. Debido a que utiliza hooks de React y acceso al DOM, el componente **debe ejecutarse en el cliente**.

### App Router (recomendado — Next.js 13+)

Crea un componente cliente dedicado para encapsular el pivot table:

```jsx
// components/PivotWrapper.jsx
"use client";

import React, { useState } from 'react';
import PivotTableUI from 'react-pivottable-plus';
import 'react-pivottable-plus/react_pivottable_plus.css';

export default function PivotWrapper({ data }) {
  const [state, setState] = useState({});

  return (
    <PivotTableUI
      data={data}
      onChange={s => setState(s)}
      {...state}
    />
  );
}
```

Luego úsalo en cualquier Server Component o página:

```jsx
// app/page.jsx  (Server Component — sin "use client")
import PivotWrapper from '@/components/PivotWrapper';

const data = [
  { producto: "Laptop", ventas: 1500 },
  { producto: "Monitor", ventas: 300 },
];

export default function Page() {
  return <PivotWrapper data={data} />;
}
```

### Pages Router (Next.js 12 y anteriores)

```jsx
// pages/dashboard.jsx
import dynamic from 'next/dynamic';
import 'react-pivottable-plus/react_pivottable_plus.css';

// Importación dinámica para evitar errores de SSR
const PivotTableUI = dynamic(
  () => import('react-pivottable-plus'),
  { ssr: false }
);

export default function Dashboard() {
  const [state, setState] = React.useState({});
  const data = [
    { producto: "Laptop", ventas: 1500 },
  ];

  return (
    <PivotTableUI
      data={data}
      onChange={s => setState(s)}
      {...state}
    />
  );
}
```

### Solución a errores comunes en Next.js

| Error | Causa | Solución |
| :--- | :--- | :--- |
| `ReferenceError: window is not defined` | El componente se renderizó en el servidor | Usar `"use client"` o importación dinámica con `ssr: false` |
| `Module not found: Can't resolve '...'` | Módulo ESM no transpilado | Agregar a `transpilePackages` en `next.config.js` |
| `Hydration failed` | Estado diferente entre servidor y cliente | Usar `"use client"` en el componente que contiene el pivot |

Si ves errores de módulos no encontrados, agrega esto a tu `next.config.js`:

```js
// next.config.js
const nextConfig = {
  transpilePackages: ['react-pivottable-plus'],
};

module.exports = nextConfig;
```

---

## 🛠️ Solución de Problemas (Troubleshooting)

### ❌ Error: `Module not found: Can't resolve 'react-pivottable-plus/react_pivottable_plus.css'`

Este error suele ocurrir en versiones antiguas o por confusión con el fork original. **react-pivottable-plus** ha estandarizado su archivo de estilos para que coincida con la identidad de la librería.

**Solución Oficial:**
Asegúrate de estar usando la ruta oficial que ahora coincide con el nombre de la librería para evitar confusiones:

```js
import 'react-pivottable-plus/react_pivottable_plus.css';
```

> [!NOTE]
> Aunque `pivottable.css` sigue funcionando como alias por compatibilidad, recomendamos migrar a `react_pivottable_plus.css`.

### ❌ Error: `ReferenceError: window is not defined`
El componente debe cargarse únicamente en el cliente. Asegúrate de añadir la directiva `"use client"` al inicio de tu archivo o usar importación dinámica con `ssr: false`.

### ❌ Estilos no se aplican correctamente
Si los estilos se ven básicos o desordenados, verifica que has importado el CSS obligatorio en tu punto de entrada principal.

## 🌈 Uso de Renderizadores Modernos

```jsx
"use client"; // Requerido en Next.js App Router

import PivotTableUI from 'react-pivottable-plus';
import { TailwindUI } from 'react-pivottable-plus/renderers/TailwindUI';
import 'react-pivottable-plus/react_pivottable_plus.css';

<PivotTableUI
  data={data}
  renderers={{ Table: TailwindUI }}
  {...state}
/>
```

## 📑 Propiedades Principales (Todas Opcionales excepto `data`)

| Propiedad | Tipo | Por Defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `data` | Array / Object | `[]` | Los datos a resumir. |
| `rows` | Array | `[]` | Atributos para las filas. |
| `cols` | Array | `[]` | Atributos para las columnas. |
| `vals` | Array | `[]` | Atributos para los valores calculados. |
| `aggregatorName` | String | `"Count"` | Nombre del agregador inicial. |
| `rendererName` | String | `"Table"` | Nombre del renderizador inicial. |
| `pagination` | Boolean | `false` | Activa el pie de página con paginación. |
| `pageSize` | Number | `20` | Cantidad de registros por página. |
| `columnResizing` | Boolean | `false` | Permite redimensionar columnas arrastrando. |
| `size` | String | `"lg"` | Tamaño de la UI: `"sm"`, `"md"` o `"lg"`. |

---

Este proyecto es la evolución profesional de las tablas dinámicas en React, diseñado para proporcionar una experiencia de usuario superior, rendimiento de grado industrial y compatibilidad total con el stack moderno (React 18/19, Next.js, Tailwind).

## ✍️ Créditos y Autoría
**react-pivottable-plus** ha sido desarrollado y es mantenido por **Jasp402**, quien ha liderado la re-arquitectura del motor, la implementación de interfaces premium (Tailwind, Shadcn, Radix UI) y la optimización de rendimiento para grandes volúmenes de datos.
