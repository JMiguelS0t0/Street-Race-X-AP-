# Historial de Solicitudes a la IA

Este archivo mantiene un registro de las solicitudes, análisis y cambios realizados por asistentes de IA en este proyecto para mantener el contexto.

## Estándares de Código (Human-Centric)
Se han establecido las siguientes reglas para asegurar que el código generado por IA sea indistinguible de uno escrito por un desarrollador Senior humano:

*   **Prioridad:** El código debe parecer hecho por humanos.
*   **Comentarios con Propósito:** Solo comentar el "por qué" de decisiones complejas o reglas de negocio no obvias. Evitar comentarios redundantes sobre "qué" hace el código.
*   **Pragmatismo:** Preferir soluciones simples y legibles. No sobre-abstraer.
*   **Naming Natural:** Nombres descriptivos pero concisos (ej: `handleAuth` en vez de `processUserAuthentication`).
*   **Agrupación Lógica:** Usar espacios en blanco para separar "párrafos" de lógica.
*   **Manejo de Errores Realista:** Evitar `try/catch` genéricos innecesarios; manejar errores donde aporten valor real.
*   **Idiomática:** Usar características modernas de TypeScript/ESNext de forma natural.


## [24/04/2026] - Análisis inicial y planeación de refactorización
- **Solicitud:** Analizar el proyecto, identificar su objetivo, revisar el estado actual y planear los requerimientos pendientes basados en los comentarios de revisión (PRs) dejados por Copilot. Crear este historial de IA.
- **Acción Realizada:** 
  - Exploración del proyecto (API de Street Race X).
  - Revisión del esquema de base de datos (`schema.prisma`).
  - Extracción de comentarios de revisión de GitHub para identificar deudas técnicas y bugs pendientes en los Pull Requests #5, #6 y #7.
  - Creación del plan de implementación (`implementation_plan.md`) para abordar problemas de seguridad en refresh tokens, bugs en Prisma (uso incorrecto de `where` con claves no únicas) y mejoras de tipado.
- **Acción Realizada (Implementación):**
  - **Auth:** Refactorizado el middleware de autenticación extrayendo `extractToken`. En `auth.controller.ts`, se implementó validación de `iat` para rechazar refresh tokens con más de 1 día de antigüedad.
  - **Prisma/Vehicles:** Reemplazados los `update` y `delete` inseguros en `vehicle.controller.ts` usando `findFirst` + `update` por `id`, y `deleteMany`.
  - **Prisma/Notifications:** Corregidas las consultas en `notification.controller.ts` usando `findFirst` + `update`, y `deleteMany`. La función `bulkUpdateNotifications` se dejó ignorando estados falsos, según lo solicitado.
  - **Tipado/Challenges:** Reemplazados los `tx: any` por `tx: Prisma.TransactionClient` en los bloques `$transaction` de `challenge.controller.ts`.
