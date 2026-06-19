# ProTrack — Gestión de Proyectos

Aplicación React completa para gestión de proyectos con seguimiento financiero, tareas, comentarios y archivos. Todos los datos persisten en **localStorage** del navegador.

---

## 📁 Estructura de archivos

```
protrack/
├── package.json
├── README.md
├── public/
│   └── index.html
└── src/
    ├── index.js
    ├── index.css
    ├── App.jsx
    ├── hooks/
    │   └── useLocalStorage.js
    ├── utils/
    │   ├── constants.js
    │   ├── helpers.js
    │   └── initialData.js
    └── components/
        ├── UI.jsx
        ├── Sidebar.jsx
        ├── Dashboard.jsx
        ├── ProjectsList.jsx
        ├── ProjectDetail.jsx
        ├── TasksTab.jsx
        ├── FinancesTab.jsx
        ├── CommentsTab.jsx
        └── FilesTab.jsx
```

---

## 🚀 Instalación y ejecución

### Requisitos previos
- **Node.js** v16 o superior → https://nodejs.org
- **npm** (viene incluido con Node.js)

### Pasos

```bash
# 1. Entra en la carpeta del proyecto
cd protrack

# 2. Instala las dependencias
npm install

# 3. Arranca el servidor de desarrollo
npm start
```

La app se abrirá automáticamente en **http://localhost:3000**

---

## 🏗️ Build para producción

```bash
npm run build
```

Genera la carpeta `build/` lista para desplegar en cualquier servidor estático (Netlify, Vercel, GitHub Pages, etc.).

---

## 💾 Persistencia de datos

Todos los cambios se guardan automáticamente en `localStorage` del navegador bajo las claves:
- `protrack_projects` — todos los proyectos, tareas, transacciones, comentarios y archivos
- `protrack_view` — la vista activa al cerrar

Para **resetear todos los datos** al estado inicial, abre las DevTools del navegador (F12) y ejecuta:

```javascript
localStorage.removeItem('protrack_projects');
localStorage.removeItem('protrack_view');
location.reload();
```

---

## ✨ Funcionalidades

### Dashboard
- KPIs globales: total proyectos, ingresos, gastos, balance, tareas activas, progreso medio
- Barras de progreso por proyecto
- Distribución de proyectos por estado
- Tabla financiera comparativa
- Alerta de proyectos urgentes

### Proyectos
- Vista de tarjetas con color, progreso (donut chart), balance, tareas pendientes
- Filtros por estado: Activo / Urgente / Pausado / Finalizado
- Crear / editar / eliminar proyectos
- Color automático por orden de creación

### Detalle de proyecto (4 pestañas)

**Tareas**
- Lista con checkbox para completar/descompletar
- Ajuste manual de progreso con slider
- Crear / editar / eliminar tareas
- Estado: Pendiente / En progreso / Completada
- Prioridad: Baja / Media / Alta

**Finanzas**
- Resumen: ingresos, gastos, balance
- Tabla de movimientos con filtro por tipo
- Añadir movimientos (concepto, importe, fecha, categoría, comentario)

**Comentarios**
- Notas de seguimiento con etiquetas: Idea / Problema / Decisión / Recordatorio / Avance
- Crear / editar / eliminar

**Archivos**
- Registro de archivos vinculados al proyecto
- Tipos: PDF / Imagen / Documento / Factura / Presupuesto / Contrato

---

## 🛠️ Dependencias

| Paquete | Versión | Uso |
|---|---|---|
| react | ^18.3.1 | Framework UI |
| react-dom | ^18.3.1 | Renderizado DOM |
| react-scripts | 5.0.1 | Toolchain (CRA) |

Sin dependencias externas de UI — diseño 100% con estilos en línea.

---

## 🌐 Despliegue rápido en Vercel

```bash
npm install -g vercel
vercel
```

O arrastra la carpeta `build/` a https://vercel.com/new
