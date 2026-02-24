# Protocolo de Operaci+¶n para Gemini (Workflow)

Este documento define las reglas estrictas y los flujos de trabajo que cualquier instancia de Gemini debe seguir en este proyecto para garantizar la consistencia, la estabilidad y el "Perfect UI".

## 1. Reglas Generales
- **IDIOIMA:** Todas las respuestas, comentarios y documentaci+¶n interna deben ser estrictamente en **Espa+¶ol**.
- **UI & DISE+ÊO:** Prohibido modificar archivos visuales (.jsx, .css, enderers/, examples/) sin consulta y aprobaci+¶n expl+°cita del usuario.
- **COMMITS:** No realizar commits ni pushes sin solicitud directa.

## 2. Flujo de Trabajo para Commits y Versiones
Este proyecto utiliza un sistema de **Auto-Versioning** mediante Git Hooks.

### Procedimiento de Subida:
1. **Validaci+¶n:** Antes de commitear, verificar que no hay errores de sintaxis en src/ o docs/.
2. **Preparaci+¶n:** Ejecutar git add . para incluir los cambios.
3. **Commit:** Al ejecutar git commit -m "mensaje", el sistema ejecutar+Ì autom+°ticamente 
pm run bump e incluir+Ì el nuevo package.json.
4. **Resoluci+¶n de Conflictos:** Si un commit falla por error de versi+¶n (ej: 403 Forbidden en NPM), forzar un incremento manual con 
pm run bump antes de re-intentar.

## 3. Gesti+¶n de Documentaci+¶n (Nextra)
- Toda mejora en funcionalidades debe ir acompa+¶ada de su actualizaci+¶n en la carpeta /docs.
- Para previsualizar cambios en docs: Usar 
pm run docs:dev.
- El despliegue a GitHub Pages es autom+°tico al hacer push a la rama master.

## 4. Est+Ìndar de Calidad (React 19)
- Mantener la compatibilidad estricta con **React 19**.
- Asegurar que todas las props pasadas a componentes core est+¨n **sanitizadas** (evitar que undefined sobreescriba los defaultProps).
