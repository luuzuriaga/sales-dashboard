const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const vendedorRoutes = require('./routes/vendedor');
const gerenteRoutes = require('./routes/gerente');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para el frontend en http://localhost:8080
app.use(cors({
  origin: 'http://localhost:8080'
}));

app.use(express.json());

// Registro de rutas
app.use('/auth', authRoutes);
app.use('/vendedor', vendedorRoutes);
app.use('/gerente', gerenteRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Gestión de Ventas' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor de Ventas iniciado en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('- [POST] /auth/login (Login)');
  console.log('- [POST] /auth/register (Registro)');
  console.log('- [GET/PUT] /vendedor/perfil');
  console.log('- [GET] /gerente/dashboard');
});
