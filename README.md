# react-pivottable-plus

`react-pivottable-plus` es una versión moderna y extendida de [react-pivottable-grouping](https://github.com/jjagielka/react-pivottable-grouping) (a su vez un fork de [react-pivottable](https://github.com/plotly/react-pivottable)), actualizada para los estándares actuales de desarrollo web y con una interfaz de usuario significativamente mejorada.

Esta biblioteca permite la exploración y el análisis de datos mediante el resumen de un conjunto de datos en una tabla dinámica con una interfaz de arrastrar y soltar (drag'n'drop) intuitiva.

## 🚀 Novedades y Mejoras

### ⚛️ Soporte para React 19
Totalmente compatible con **React 19**, aprovechando las últimas mejoras de rendimiento y estabilidad del ecosistema.

### 🎨 Interfaces de Usuario Modernas
Se han incluido renderizadores de alta calidad basados en frameworks modernos:
- **Tailwind CSS**: Una interfaz limpia, moderna y altamente personalizable.
- **Shadcn/UI**: Diseño profesional basado en componentes de Radix UI y Tailwind.
- **Radix UI**: Soporte nativo para componentes accesibles y robustos.

### 📊 Paginación y Totalización (Nuevo Footer)
Se ha añadido un pie de página inteligente que incluye:
- **Paginación avanzada**: Control de página actual y tamaño de página (registros por página).
- **Totalización**: Visualización en tiempo real del total de registros procesados y el total de filas resultantes en la tabla dinámica.

### 📉 Agrupación y Subtotales
Incluye soporte nativo para la agrupación de filas y columnas con cálculo automático de **subtotales**, permitiendo colapsar y expandir secciones para un análisis de datos más profundo.

## 📦 Instalación

```bash
npm install --save react-pivottable-plus react react-dom
```

## 🛠️ Uso Básico

```jsx
import React, { useState } from 'react';
import PivotTableUI from 'react-pivottable-plus/PivotTableUI';
import 'react-pivottable-plus/pivottable.css';

const data = [
  { producto: "Manzana", categoria: "Fruta", ventas: 100 },
  { producto: "Pera", categoria: "Fruta", ventas: 150 },
  // ... más datos
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

## 🌈 Uso de Renderizadores Modernos (Tailwind / Shadcn / Radix)

Para utilizar las nuevas interfaces, importa el renderizador correspondiente desde la carpeta de renderers:

```jsx
import { TailwindUI } from 'react-pivottable-plus/renderers/TailwindUI';
// O bien:
// import { ShadcnDashboardUI } from 'react-pivottable-plus/renderers/ShadcnDashboardUI';
// import { RadixUI } from 'react-pivottable-plus/renderers/RadixUI';

// En tu componente:
<PivotTableUI
  data={data}
  rendererName="Table" // o el nombre que prefieras
  renderers={{ Table: TailwindUI }}
  {...state}
/>
```

## 📑 Propiedades Principales

| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `data` | Array / Object | Los datos a resumir (formato JSON o Array de Arrays). |
| `rows` | Array | Atributos para las filas. |
| `cols` | Array | Atributos para las columnas. |
| `vals` | Array | Atributos para los valores calculados. |
| `pagination` | Boolean | Activa/Desactiva el pie de página con paginación. |
| `pageSize` | Number | Cantidad de registros por página (Default: 20). |
| `hiddenAttributes` | Array | Atributos que no se mostrarán en la UI. |

---

Este proyecto es un fork mantenido de `react-pivottable` con el objetivo de proporcionar una experiencia de usuario superior y compatibilidad con las últimas versiones de React.

## ✍️ Créditos y Autoría
Esta versión moderna y extendida (`react-pivottable-plus`) ha sido desarrollada y mantenida por **Jasp402**, quien ha liderado la implementación de las nuevas interfaces (Tailwind, Shadcn, Radix), la actualización a React 19 y la optimización del motor de arrastre y filtrado.
