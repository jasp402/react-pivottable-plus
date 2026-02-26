# react-pivottable-plus

[![NPM Version](https://img.shields.io/npm/v/react-pivottable-plus.svg)](https://www.npmjs.com/package/react-pivottable-plus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)

**La solución definitiva de Tablas Dinámicas para el ecosistema moderno de React.**

`react-pivottable-plus` es una versión premium y mantenida de `react-pivottable`, rediseñada para ofrecer una experiencia de usuario excepcional con soporte nativo para Tailwind CSS, Radix UI y Shadcn.

## 🌐 Enlaces Rápidos

- 📚 **[Documentación Oficial](https://jasp402.github.io/react-pivottable-plus/)**
- 🚀 **[Guía de Inicio Rápido](https://jasp402.github.io/react-pivottable-plus/docs/get-started)**
- 🎨 **[Galería de Interfaces](https://jasp402.github.io/react-pivottable-plus/examples/gallery)**

## 🚀 Por qué elegir esta versión?

A diferencia de otros forks estancados, `react-pivottable-plus` ofrece:

- **Soporte React 19**: Construido sobre los estándares más recientes.
- **UI de Próxima Generación**: Renderizadores modernos integrados.
- **Paginación Inteligente**: Rendimiento fluido con grandes conjuntos de datos.
- **Configuración Cero**: Implementación en segundos con valores por defecto robustos.

## 📦 Instalación

```bash
npm install --save react-pivottable-plus react react-dom
```

## 🛠️ Uso Básico (Zero Config)

Gracias a las últimas optimizaciones, implementar la tabla dinámica es más sencillo que nunca. La mayoría de las propiedades ya tienen valores por defecto inteligentes.

```jsx
"use client";

import React, { useState } from 'react';
import PivotTableUI from 'react-pivottable-plus'; // Importación directa
import 'react-pivottable-plus/pivottable.css';

const data = [
  { producto: "Manzana", categoria: "Fruta", ventas: 100 },
  { producto: "Pera", categoria: "Fruta", ventas: 150 },
];

function App() {
  // Solo necesitas gestionar el estado si quieres persistir la configuración
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

## 🌈 Uso de Renderizadores Modernos

La librería incluye renderizadores premium listos para usar. No necesitas configurarlos manualmente, solo indica el nombre si ya los has incluido en el objeto `renderers`, o pásalos directamente:

```jsx
import { TailwindUI } from 'react-pivottable-plus/renderers/TailwindUI';

// En tu componente:
<PivotTableUI
  data={data}
  renderers={{ Table: TailwindUI }} // Sobrescribe el renderizador por defecto
  {...state}
/>
```

## 📑 Propiedades Principales (Todas Opcionales)

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

---

Este proyecto es un fork mantenido de `react-pivottable` con el objetivo de proporcionar una experiencia de usuario superior y compatibilidad con las últimas versiones de React.

## ✍️ Créditos y Autoría
Esta versión moderna y extendida (`react-pivottable-plus`) ha sido desarrollada y mantenida por **Jasp402**, quien ha liderado la implementación de las nuevas interfaces (Tailwind, Shadcn, Radix), la actualización a React 19 y la optimización del motor de arrastre y filtrado.
