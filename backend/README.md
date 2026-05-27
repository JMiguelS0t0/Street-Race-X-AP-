# 🏁 Street Race X API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.x-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-indigo.svg)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black.svg)](https://socket.io/)
[![Database](https://img.shields.io/badge/Database-SQL%20Server-red.svg)](https://www.microsoft.com/sql-server)

**Street Race X API** es el motor principal y backend del ecosistema Street Race X. Es una API RESTful y de eventos en tiempo real diseñada para gestionar el ranking de pilotos de carreras urbanas, coordinar retos cara a cara (challenges), registrar vehículos modificados, enviar notificaciones push en tiempo real y habilitar chats grupales y directos entre corredores.

---

## 🚀 Tecnologías Principales

El proyecto está construido bajo una arquitectura robusta y moderna utilizando:

*   **[Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/):** Entorno de ejecución rápido y lenguaje con tipado estático para código mantenible y seguro.
*   **[Express.js](https://expressjs.com/):** Framework web rápido y minimalista para la creación de los Endpoints REST.
*   **[Prisma ORM](https://www.prisma.io/):** ORM de última generación para modelado de datos y consultas tipadas hacia SQL Server.
*   **[Microsoft SQL Server](https://www.microsoft.com/sql-server):** Motor de base de datos relacional para la persistencia de datos históricos de pilotos y retos.
*   **[Socket.io](https://socket.io/):** Comunicación bidireccional y basada en eventos en tiempo real para chats y localización en vivo.
*   **[Swagger (OpenAPI 3.0)](https://swagger.io/):** Documentación interactiva de la API para facilitar la integración con el cliente (Frontend/App Móvil).
*   **[Zod](https://zod.dev/):** Validación estricta de esquemas y datos de entrada en las peticiones HTTP.
*   **[JWT (JSON Web Tokens) & Bcryptjs](https://jwt.io/):** Autenticación y cifrado seguro de contraseñas de pilotos.

---

## 🛠️ Estructura del Proyecto

El backend sigue un patrón modular limpio y organizado:

```text
backend/
├── prisma/                  # Configuración y Esquema de Prisma
│   └── schema.prisma        # Definición del modelo de datos de la DB
├── src/
│   ├── config/              # Configuraciones de clientes (Prisma, Swagger)
│   ├── controllers/         # Lógica de controladores HTTP (Auth, Users, Challenges, etc.)
│   ├── docs/                # Documentación en Swagger
│   ├── middlewares/         # Middlewares de Express (Autenticación JWT, validación de Sockets, etc.)
│   ├── routes/              # Rutas de la API REST (/auth, /users, /vehicles, /challenges, /notifications, etc.)
│   ├── services/            # Servicios de negocio adicionales
│   ├── sockets/             # Controladores y manejadores de Socket.io (Chat y Geolocalización)
│   ├── types/               # Definición de tipos de TypeScript globales
│   ├── utils/               # Funciones auxiliares y formateadores
│   ├── app.ts               # Configuración central de Express middlewares y rutas
│   └── server.ts            # Servidor HTTP nativo e inicialización de Sockets
├── tsconfig.json            # Configuración del compilador de TypeScript
└── package.json             # Dependencias del proyecto y scripts npm
```

---

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

1.  **Node.js** (Versión LTS recomendada, v18 o superior).
2.  **Microsoft SQL Server** local o en la nube configurado con autenticación SQL.
3.  Un cliente de base de datos como Azure Data Studio o SQL Server Management Studio (SSMS) (opcional).

---

## 🔧 Guía de Instalación y Configuración

Sigue estos pasos para configurar tu entorno de desarrollo local:

### 1. Clonar el repositorio e instalar dependencias
Entra en la carpeta del backend e instala todos los paquetes necesarios de `npm`:

```bash
cd backend
npm install
```

### 2. Variables de Entorno
Crea un archivo `.env` en la raíz de la carpeta `backend/` basándote en la siguiente configuración estándar:

```env
# Puerto del Servidor
PORT=2999

# URL de conexión de Microsoft SQL Server (Reemplaza con tus credenciales)
# Formato: sqlserver://<servidor>:<puerto>;database=<db>;user=<usuario>;password=<contraseña>;encrypt=true;trustServerCertificate=true;
DATABASE_URL="sqlserver://localhost:1433;database=street_race_x;user=sa;password=TuPasswordSeguro123;encrypt=true;trustServerCertificate=true;"

# Secreto para firmar tokens JWT
JWT_SECRET="ClaveSecretaSuperDificilDeAdivinarParaStreetRaceX2026!"
```

### 3. Sincronización y Configuración de Base de Datos (Prisma)
Una vez configurado el archivo `.env`, ejecuta los siguientes comandos para generar el cliente de Prisma y mapear el esquema a tu servidor de SQL Server:

```bash
# Generar el Cliente de Prisma
npx prisma generate

# Sincronizar el esquema con la base de datos (crea las tablas automáticamente)
npx prisma db push
```

*(Opcional)* Si deseas explorar visualmente los datos de tu base de datos local usando Prisma Studio, ejecuta:
```bash
npx prisma studio
```

---

## 🚦 Ejecución del Proyecto

El proyecto incluye scripts predefinidos en `package.json` para facilitar el ciclo de desarrollo y despliegue:

### Modo Desarrollo (con recarga automática mediante Nodemon)
```bash
npm run dev
```
El servidor se levantará por defecto en `http://localhost:2999`.

### Modo Producción (Compilar y Ejecutar)
Para compilar el código TypeScript a JavaScript nativo y ejecutar la versión optimizada:

```bash
# Compilar TypeScript a la carpeta /dist
npm run build

# Iniciar servidor compilado
npm start
```

---

## 📚 Documentación Interactiva de la API

La API cuenta con documentación autogenerada bajo el estándar OpenAPI (Swagger). Una vez que el servidor esté en ejecución, puedes ingresar a:

🔗 **`http://localhost:2999/api-docs`**

Aquí podrás consultar todos los endpoints REST, parámetros esperados, esquemas de entrada/salida y probar las solicitudes HTTP directamente desde el navegador.

---

## 💬 Comunicación en Tiempo Real (WebSockets)

El servidor utiliza **Socket.io** para implementar funciones en tiempo real. Los principales namespaces e integraciones son:

1.  **Chat en Vivo (`src/sockets/chat.socket.ts`):** 
    *   Gestión de salas de chat y mensajes instantáneos entre corredores.
    *   Eventos como `join_room`, `send_message`, y recepción de mensajes en vivo.
2.  **Geolocalización en Vivo (`src/sockets/location.socket.ts`):**
    *   Envío y recepción de ubicaciones de pilotos durante eventos y retos acordados.
3.  **Middlewares de Seguridad en Sockets (`src/middlewares/socketAuth.middleware.ts`):**
    *   Garantiza que solo pilotos autenticados con un token JWT válido puedan conectarse a los flujos de Socket.io.
