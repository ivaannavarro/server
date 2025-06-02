const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const citasRoutes = require('./routes/citasRoutes');
const specialtyRoutes = require('./routes/specialtyRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas API - Orden específico
app.use('/api/chatbot/departments', departmentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/specialty', specialtyRoutes);

// En producción, servir archivos estáticos del frontend
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  // Servir archivos estáticos
  app.use(express.static(frontendPath));
  
  // Servir los assets estáticos
  app.use('/assets', express.static(path.join(frontendPath, 'assets')));
  
  // Manejar todas las demás rutas para el SPA
  app.get('/*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});