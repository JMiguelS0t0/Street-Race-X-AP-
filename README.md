# 🏁 Street Race X

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.x-brightgreen.svg)](https://nodejs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-indigo.svg)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black.svg)](https://socket.io/)
[![Database](https://img.shields.io/badge/Database-SQL%20Server-red.svg)](https://www.microsoft.com/sql-server)

**Street Race X** es una plataforma web y de tiempo real completa diseñada para el ecosistema de carreras urbanas. Permite a los pilotos crear perfiles, registrar y modificar vehículos, enviarse retos cara a cara con ubicaciones y fechas acordadas, subir de rango (D a A/S) según sus victorias/derrotas, comunicarse a través de chats interactivos y seguir ubicaciones en vivo durante los retos.

El proyecto está estructurado como un repositorio monorreferencia compuesto por dos aplicaciones principales:
1.  **`/backend`**: Servidor Express.js con TypeScript, Prisma ORM (para MS SQL Server) y Sockets en tiempo real.
2.  **`/frontend`**: Aplicación web SPA moderna construida con React, Vite y TailwindCSS.

---

## 📂 Estructura del Repositorio

```text
Street-Race-X-AP-/
├── backend/             # Código fuente del Servidor REST & WebSockets
│   ├── prisma/          # Esquema de base de datos y migraciones
│   └── src/             # Controladores, Sockets, Rutas y Middlewares
├── frontend/            # Código fuente del Cliente Web (SPA)
│   ├── public/          # Recursos estáticos públicos
│   └── src/             # Componentes de React, Hooks, Vistas y Servicios
└── README.md            # Documentación principal del proyecto
```

---

## 🛠️ Tecnologías Utilizadas

### Backend
*   **Node.js & TypeScript**
*   **Express.js** (API REST)
*   **Prisma ORM** (Modelado y consultas tipadas)
*   **Microsoft SQL Server** (Base de datos relacional)
*   **Socket.io** (Comunicación en tiempo real para Chat y Geolocalización)
*   **Swagger (OpenAPI)** (Documentación interactiva de la API en `/api-docs`)
*   **Zod** (Validación estricta de payloads)
*   **JWT & Bcryptjs** (Autenticación y hash de contraseñas)

### Frontend
*   **React 19** (Componentes de interfaz interactivos)
*   **Vite 8** (Build tool ultrarrápido y servidor de desarrollo)
*   **TypeScript** (Robustez y autocompletado en el desarrollo)
*   **TailwindCSS 4** (Estilizado responsive y moderno)
*   **React Router DOM 7** (Enrutamiento del cliente)
*   **Axios** (Cliente HTTP para consumir la API)
*   **Socket.io-client** (Conexión WebSocket para mensajería en tiempo real)
*   **Lucide React** (Set de iconos premium minimalistas)

---

## 📋 Requisitos Previos

Antes de comenzar a ejecutar Street Race X, asegúrate de tener instalado:
*   [Node.js](https://nodejs.org/) (Versión v18.x o superior recomendada)
*   Una instancia activa de [Microsoft SQL Server](https://www.microsoft.com/sql-server) local o remota.

---

## 🔧 Guía de Instalación y Configuración

Sigue estos pasos detallados para configurar ambas aplicaciones localmente.

### 1. Configurar el Backend

1.  Navega al directorio del backend e instala las dependencias:
    ```bash
    cd backend
    npm install
    ```
2.  Crea un archivo `.env` en la raíz de `backend/` basándote en la siguiente plantilla:
    ```env
    PORT=2999
    # URL de conexión de SQL Server
    DATABASE_URL="sqlserver://localhost:1433;database=street_race_x;user=sa;password=TuPasswordSeguro123;encrypt=true;trustServerCertificate=true;"
    JWT_SECRET="ClaveSecretaSuperDificilDeAdivinarParaStreetRaceX2026!"
    ```
3.  Genera los tipos del cliente Prisma y sincroniza la estructura del esquema con tu base de datos SQL Server:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

### 2. Configurar el Frontend

1.  Navega al directorio del frontend e instala las dependencias:
    ```bash
    cd ../frontend
    npm install
    ```
2.  Crea un archivo `.env` en la raíz de `frontend/` basándote en el archivo `.env.example`:
    ```env
    VITE_API_URL=http://localhost:2999
    VITE_WS_URL=http://localhost:2999
    ```

---

## 🚦 Ejecución en Entorno de Desarrollo

Para levantar el proyecto completo, abre dos terminales separadas en el directorio principal:

### Terminal 1: Servidor Backend
```bash
cd backend
npm run dev
```
*El backend se ejecutará en http://localhost:2999*
*Documentación interactiva disponible en http://localhost:2999/api-docs*

### Terminal 2: Cliente Frontend
```bash
cd frontend
npm run dev
```
*El frontend se levantará en el puerto indicado por Vite (típicamente http://localhost:5173)*

---

## 📦 Compilación para Producción

Si deseas generar las carpetas de distribución compiladas y optimizadas para producción:

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```
