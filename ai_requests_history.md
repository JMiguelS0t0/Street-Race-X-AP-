# Historial de Solicitudes a la IA

Este archivo mantiene un registro de las solicitudes, análisis y cambios realizados por asistentes de IA en este proyecto para mantener el contexto.

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
